const mongoose = require('mongoose');
const logger = require('../../logger');
const { CALIBRATION_PASS_RESULT } = require('./constants');

const itemRepository = require('../../repositories/mongodb/itemRepositoryMongo');
const itemActionsHistoryRepository = require('../../repositories/mongodb/itemActionHistoryRepositoryMongo');

async function saveActionAndUpdateParams(itemAction) {

  logger.debug(`Going to start a session to save item Action ${itemAction.actionName} for item SN ${itemAction.itemSerialNumber}.`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Save action history
    await itemActionsHistoryRepository.addItemAction(itemAction, session);

    logger.debug(`Inside session: Item Action ${itemAction.actionName} saved for item SN ${itemAction.itemSerialNumber}. Going to update item parameters.`);

    // if result Pass => save params in item, if Fail => do not
    if(itemAction.result === CALIBRATION_PASS_RESULT)
    {
      // Update item parameters
      await itemRepository.updateItemParameters(itemAction.itemSerialNumber, itemAction.parameters, session);

      logger.debug(`Inside session: result is Pass, so parameters updated for item SN ${itemAction.itemSerialNumber}. Committing transaction.`);
    }
    else
    {
      logger.debug(`Inside session: result is Fail, so parameters NOT updated for item SN ${itemAction.itemSerialNumber}. Committing transaction.`);
    }

    await session.commitTransaction();
    session.endSession();
    return { ok: true };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { saveActionAndUpdateParams };
