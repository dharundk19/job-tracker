const Job = require('../models/Job.model');
const cloudinary = require('../services/upload.service');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

exports.getJobs = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (search)
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];

    const sortOpt = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const jobs = await Job.find(query).sort(sortOpt);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, user: req.user._id });
    // Emit socket event
    if (req.io) req.io.to(req.user._id.toString()).emit('job:created', job);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    // Emit socket event
    if (req.io) req.io.to(req.user._id.toString()).emit('job:updated', job);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (req.io) req.io.to(req.user._id.toString()).emit('job:deleted', req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'jobtrackr/resumes',
      resource_type: 'raw',
    });

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { resumeUrl: result.secure_url },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('JobTrackr - My Applications', { align: 'center' });
    doc.moveDown();

    jobs.forEach((job, i) => {
      doc
        .fontSize(13)
        .text(`${i + 1}. ${job.company} — ${job.role}`)
        .fontSize(10)
        .text(`Status: ${job.status}  |  Location: ${job.location || 'N/A'}  |  Salary: ${job.salary || 'N/A'}`)
        .text(`Applied: ${new Date(job.createdAt).toLocaleDateString()}`)
        .moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    const fields = ['company', 'role', 'status', 'location', 'salary', 'jobUrl', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(jobs);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminGetAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
