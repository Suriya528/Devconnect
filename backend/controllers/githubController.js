const asyncHandler = require('../middleware/asyncHandler')
const Student = require('../models/user')
const Post = require('../models/post')

// @desc    Connect GitHub account via OAuth
// @route   POST /api/github/connect
// @access  Private
const connectGitHub = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) {
    res.status(400)
    throw new Error('Authorization code is required')
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    res.status(400)
    throw new Error(tokenData.error_description || 'Failed to get GitHub access token')
  }

  const accessToken = tokenData.access_token

  // Fetch GitHub user profile
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  })

  const ghUser = await userRes.json()
  if (!ghUser.id) {
    res.status(400)
    throw new Error('Failed to fetch GitHub profile')
  }

  // Update user with GitHub data
  const user = await Student.findByIdAndUpdate(
    req.user._id,
    {
      githubId: String(ghUser.id),
      githubUsername: ghUser.login,
      githubAccessToken: accessToken,
      github: ghUser.html_url
    },
    { new: true }
  ).select('-password -githubAccessToken')

  res.json(user)
})

// @desc    Disconnect GitHub account
// @route   POST /api/github/disconnect
// @access  Private
const disconnectGitHub = asyncHandler(async (req, res) => {
  await Student.findByIdAndUpdate(req.user._id, {
    githubId: '',
    githubUsername: '',
    githubAccessToken: ''
  })
  res.json({ message: 'GitHub disconnected' })
})

// @desc    Get current user's GitHub repos
// @route   GET /api/github/repos
// @access  Private
const getGitHubRepos = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id).select('+githubAccessToken')
  if (!user?.githubAccessToken) {
    res.status(400)
    throw new Error('GitHub not connected')
  }

  const ghRes = await fetch(
    'https://api.github.com/user/repos?sort=updated&per_page=6&type=owner',
    {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: 'application/json'
      }
    }
  )

  const repos = await ghRes.json()
  if (!Array.isArray(repos)) {
    res.status(502)
    throw new Error('Failed to fetch repos from GitHub')
  }

  res.json(
    repos.map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      updated_at: r.updated_at
    }))
  )
})

// @desc    Get repos by GitHub username (public)
// @route   GET /api/github/repos/:username
// @access  Private
const getGitHubReposByUsername = asyncHandler(async (req, res) => {
  const ghRes = await fetch(
    `https://api.github.com/users/${req.params.username}/repos?sort=updated&per_page=6&type=owner`,
    { headers: { Accept: 'application/json' } }
  )

  const repos = await ghRes.json()
  if (!Array.isArray(repos)) {
    res.status(502)
    throw new Error('Failed to fetch repos from GitHub')
  }

  res.json(
    repos.map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      updated_at: r.updated_at
    }))
  )
})

// @desc    Get current user's GitHub contributions
// @route   GET /api/github/contributions
// @access  Private
const getGitHubContributions = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id).select('+githubAccessToken')
  if (!user?.githubAccessToken) {
    res.status(400)
    throw new Error('GitHub not connected')
  }

  const query = `query {
    viewer {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }`

  const ghRes = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${user.githubAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  const data = await ghRes.json()
  const calendar = data?.data?.viewer?.contributionsCollection?.contributionCalendar

  if (!calendar) {
    res.status(502)
    throw new Error('Failed to fetch contribution data')
  }

  res.json(calendar)
})

// @desc    Get contributions by GitHub username
// @route   GET /api/github/contributions/:username
// @access  Private
const getGitHubContributionsByUsername = asyncHandler(async (req, res) => {
  // GraphQL requires auth — use requesting user's token
  const user = await Student.findById(req.user._id).select('+githubAccessToken')

  // Try the target user's token if requester has none
  let token = user?.githubAccessToken
  if (!token) {
    const targetUser = await Student.findOne({
      githubUsername: req.params.username
    }).select('+githubAccessToken')
    token = targetUser?.githubAccessToken
  }

  if (!token) {
    res.status(400)
    throw new Error('No GitHub token available')
  }

  const query = `query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }`

  const ghRes = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables: { username: req.params.username } })
  })

  const data = await ghRes.json()
  const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar

  if (!calendar) {
    res.status(502)
    throw new Error('Failed to fetch contribution data')
  }

  res.json(calendar)
})

// @desc    Import top GitHub repos as posts
// @route   POST /api/github/import-repos
// @access  Private
const importReposAsPosts = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id).select('+githubAccessToken')
  if (!user?.githubAccessToken) {
    res.status(400)
    throw new Error('GitHub not connected')
  }

  const ghRes = await fetch(
    'https://api.github.com/user/repos?sort=stars&direction=desc&per_page=3&type=owner',
    {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: 'application/json'
      }
    }
  )

  const repos = await ghRes.json()
  if (!Array.isArray(repos)) {
    res.status(502)
    throw new Error('Failed to fetch repos')
  }

  const created = []
  for (const repo of repos) {
    // Skip if already imported
    const exists = await Post.findOne({
      name: user._id,
      githubLink: repo.html_url
    })
    if (exists) continue

    const post = await Post.create({
      name: user._id,
      text: repo.description
        ? `🚀 ${repo.name}: ${repo.description}`
        : `🚀 Check out my project: ${repo.name}`,
      techStack: repo.language ? [repo.language] : [],
      githubLink: repo.html_url,
      demoLink: repo.homepage || ''
    })

    const populated = await post.populate('name', 'name role')
    created.push(populated)
  }

  res.status(201).json({
    message: `${created.length} repo(s) imported as posts`,
    posts: created
  })
})

module.exports = {
  connectGitHub,
  disconnectGitHub,
  getGitHubRepos,
  getGitHubReposByUsername,
  getGitHubContributions,
  getGitHubContributionsByUsername,
  importReposAsPosts
}
