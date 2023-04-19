const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const { Op } = require('sequelize');
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

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

//returns the unpaid jobs of loggedin users (returns the list even if contract is terminated and unpaid)
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
                status: 'in_progress', //-- i dont think we need this line as we need terminated contracts also
            },
        }],
    });
    
});

module.exports = app;
