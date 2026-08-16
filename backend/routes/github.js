const express = require('express')
const router = express.Router()
const {
  connectGitHub,
  disconnectGitHub,
  getGitHubRepos,
  getGitHubReposByUsername,
  getGitHubContributions,
  getGitHubContributionsByUsername,
  importReposAsPosts
} = require('../controllers/githubController')
const { protect } = require('../middleware/authmiddleware')

router.post('/connect', protect, connectGitHub)
router.post('/disconnect', protect, disconnectGitHub)
router.get('/repos', protect, getGitHubRepos)
router.get('/contributions', protect, getGitHubContributions)
router.get('/contributions/:username', protect, getGitHubContributionsByUsername)
router.get('/repos/:username', protect, getGitHubReposByUsername)
router.post('/import-repos', protect, importReposAsPosts)

module.exports = router
