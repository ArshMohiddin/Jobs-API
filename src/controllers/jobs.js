const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user.userId }).sort("updatedAt");
	res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const job = await Job.findOne({
		_id: jobId,
		createdBy: userId,
	});

	if (!job) throw new NotFoundError(`No job found with ${jobId}`);
	res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
	req.body.createdBy = req.user.userId;
	const job = await Job.create(req.body);
	res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
	const {
		body: { company, position },
		user: { userId },
		params: { id: jobId },
	} = req;

	if (!company || !position)
		throw new BadRequestError("Company or position fields cannot be empty");

	const updatedJob = await Job.findOneAndUpdate(
		{ _id: jobId, createdBy: userId },
		req.body,
		{ new: true, runValidators: true }
	);

	if (!updatedJob) throw new NotFoundError(`No job found with ${jobId}`);
	res.status(StatusCodes.OK).json({ updatedJob });
};

const deleteJob = async (req, res) => {
	const {
		body: { company, position },
		user: { userId },
		params: { id: jobId },
	} = req;

	const deletedJob = await Job.findOneAndRemove({
		_id: jobId,
		createdBy: userId,
	});

	if (!deletedJob) throw new NotFoundError(`No job found with ${jobId}`);
	res.status(StatusCodes.OK).send({ success: "true" });
};

module.exports = {
	getAllJobs,
	getJob,
	createJob,
	updateJob,
	deleteJob,
};
