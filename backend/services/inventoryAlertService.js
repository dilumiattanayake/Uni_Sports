const Inventory = require('../models/Inventory');
const User = require('../models/User');
const { sendInventoryRestockedEmail } = require('./emailService');

const alertWaitlistedStudentsForInventory = async (inventoryItem) => {
  if (!inventoryItem || inventoryItem.availableQuantity <= 0 || !inventoryItem.waitlist?.length) {
    return { sent: 0 };
  }

  const waitlistedIds = inventoryItem.waitlist.map((entry) => entry.student);
  const students = await User.find({ _id: { $in: waitlistedIds }, isActive: true }).select('name email');

  let sent = 0;
  for (const student of students) {
    if (!student.email) {
      continue;
    }

    const result = await sendInventoryRestockedEmail(student.email, student.name, {
      itemName: inventoryItem.itemName,
      availableQuantity: inventoryItem.availableQuantity,
    });

    if (result.success) {
      sent += 1;
    }
  }

  inventoryItem.waitlist = [];
  await inventoryItem.save();

  return { sent };
};

const processRestockAlertsForInventoryIds = async (inventoryIds = []) => {
  const uniqueIds = [...new Set(inventoryIds.filter(Boolean).map((id) => id.toString()))];

  if (!uniqueIds.length) {
    return { processed: 0, sent: 0 };
  }

  const inventoryItems = await Inventory.find({ _id: { $in: uniqueIds } });
  let sent = 0;

  for (const item of inventoryItems) {
    const result = await alertWaitlistedStudentsForInventory(item);
    sent += result.sent;
  }

  return {
    processed: inventoryItems.length,
    sent,
  };
};

module.exports = {
  alertWaitlistedStudentsForInventory,
  processRestockAlertsForInventoryIds,
};
