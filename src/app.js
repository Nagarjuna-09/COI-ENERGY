const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const { Op } = require('sequelize');
const {getProfile} = require('./middleware/getProfile')
// const { sequelize, Op } = require('sequelize');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const { Job } = require('./model');
const { Contract } = require('./model');

//returns the list of contracts that the logged in user is engaged in
app.get('/contracts/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models');
    const { id } = req.params;
    const { profile } = req;

    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                { ClientId: profile.id },
                { ContractorId: profile.id },
            ],
        },
    });

    if (!contract) {
        return res.status(404).end();
    }
    res.json(contract);
});

//returns the list of non-terminated contracts for the loggedin user
app.get('/contracts', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [
                { ClientId: req.profile.id },
                { ContractorId: req.profile.id },
            ],
            status: { [Op.ne]: 'terminated' }, //excluding terminated contracts
        },
    })
    res.json(contracts)
})

//returns the unpaid jobs of loggedin users (returns for only active contracts, excludes terminated and new even if they have dues)
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const { Contract, Job } = req.app.get('models');
    const jobs = await Job.findAll({
        include: [{
            model: Contract,
            where: {
                [Op.or]: [
                    { ClientId: req.profile.id },
                    { ContractorId: req.profile.id },
                ],
                status: 'in_progress',
            },
        }],
    });
    const filteredJobs = jobs.filter(job => job.paid === null);
    res.json(filteredJobs);
});


//Paying for jobs of loggedin user
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models');
    const { job_id } = req.params;
    const { profile } = req;

    const job = await Job.findOne({
        include: [{
            model: Contract,
            where: {
                [Op.or]: [
                    { ClientId: profile.id },
                    { ContractorId: profile.id },
                ],
            },
        }],
        where: { id: job_id }
    });

    if (!job) {
        return res.status(404).end();
    }

    // checking if the job is already paid
    if (job.paid) {
        return res.status(400).json({ message: 'The job is already paid.' });
    }

    const contractor = await Profile.findOne({ where: { id: job.Contract.ContractorId } });
    const client = await Profile.findOne({ where: { id: job.Contract.ClientId } });

    if (profile.type === 'client') {
        // checking if client has enough balance to pay for the job
        if (client.balance < job.price) {
            return res.status(400).json({ message: 'Insufficient balance.' });
        }

        // updating client and contractor balances
        await client.update({ balance: client.balance - job.price });
        await contractor.update({ balance: contractor.balance + job.price });

        // marking job as paid and update payment date
        await job.update({ paid: true, paymentDate: new Date() });
        res.json({ message: 'Payment successful.' });
    } else {
        return res.status(401).json({ message: 'Unauthorized.' });
    }
});

//client can deposit money and that has a limit to 0.25% of his dues- working model
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const { Profile, Job } = req.app.get('models');
    const { userId } = req.params;
    const { profile } = req;

    if (profile.type !== 'client') {
        return res.status(403).send('Only clients can deposit money');
    }

    const amountToDeposit = req.body.amount;
    if (!amountToDeposit || typeof amountToDeposit !== 'number' || amountToDeposit <= 0) {
        return res.status(400).send('Invalid amount');
    }

    const jobsToPay = await Job.findAll({
        where: { paid: null },
        include: [{
            model: Contract,
            where: {
                [Op.or]: [
                    { ClientId: req.profile.id },
                    { ContractorId: req.profile.id },
                ],
                //status: 'in_progress',
            },
        }],
    });

    const totalJobsToPay = jobsToPay.reduce((total, job) => total + job.price, 0);

    // Check if the amount to deposit exceeds the 25% limit
    const maxDeposit = totalJobsToPay * 0.25;
    console.log(maxDeposit);
    if (amountToDeposit > maxDeposit) {
        return res.status(400).send('Deposit amount exceeds the limit');
    }

    // Update the client's balance and save the profile
    profile.balance += amountToDeposit;
    await profile.save();

    res.send('Deposit successful');
});



module.exports = app;

