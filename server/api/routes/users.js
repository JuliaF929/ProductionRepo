const express = require('express');
const { HTTP_STATUS, STRING_CONSTANTS } = require('../../../shared/constants');
const router = express.Router();
const logger = require('../../logger');

const User = require('../models/users');

router.get('/', async (req, res) => {
    try {
        const users = [
            new User({
              _id: "u1",
              name: "Alice Cohen",
              email: "alice@example.com",
              roles: ["admin"],
              status: "active",
              invitedBy: "system",
            }),
            new User({
              _id: "u2",
              name: "Ben Levi",
              email: "ben@example.com",
              roles: ["technician"],
              status: "invited",
              invitedBy: "u1",
            }),
            new User({
              _id: "u3",
              name: "Dana Shapiro",
              email: "dana@example.com",
              roles: ["viewer", "qa"],
              status: "disabled",
              invitedBy: "u2",
            }),
          ];
        
          res.status(200).json(users);
    }
    catch (error)
    {
      logger.debug(`Failed to get all users ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all users.' });
    }
  });

router.get('/roles', async (req, res) => {
    try {
        const availableRoles = {
            roles: ["Operator", "Process Engineer", "Manager", "Auditor", "Admin"],
          };

          res.status(200).json(availableRoles);
    }
    catch (error)
    {
      logger.debug(`Failed to get all users ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get all users.' });
    }
  });

router.post('/', async (req, res, next) => {

    logger.debug(`FULL BODY: ${JSON.stringify(req.body, null, 2)}`);
    logger.debug(`req.body.name is ${req.body.name}, req.body.email is ${req.body.email}`);

    //0. validate that user with the email does not already exist
    //const existingUser = await itemRepository.itemExists(req.body.email);
    const existingUser = false; //TODO julia: implement user existence check

    if (existingItem) {
      // Duplicate found, abort
      logger.debug(`User with this email ${req.body.email} already exists.`);
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`User with email '${req.body.email}' already exists.`);
    }

    //1. create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      roles: req.body.roles || [STRING_CONSTANTS.UNKNOWN_ROLE],
      status: STRING_CONSTANTS.USER_STATUS_INVITED,
      invitedBy: req.body.invitedBy || 'system'
    });

    //2. TODO: save user to DB (already SQL)
    //3. use Auth0 Management API to create user in Auth0 with M2M apis
    res.status(HTTP_STATUS.CREATED).json({
      message: 'Row added successfully'
    });
});

module.exports = router;