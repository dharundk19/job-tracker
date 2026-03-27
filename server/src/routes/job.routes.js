const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  uploadResume,
  exportPDF,
  exportCSV,
  adminGetAllJobs,
} = require('../controllers/job.controller');

// All routes below require auth
router.use(protect);

router.get('/export/pdf', exportPDF);
router.get('/export/csv', exportCSV);

router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(getJob).put(updateJob).delete(deleteJob);
router.post('/:id/resume', upload.single('resume'), uploadResume);

// Admin route
router.get('/admin/all', adminOnly, adminGetAllJobs);

module.exports = router;
