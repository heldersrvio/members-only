const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	timestamp: { type: Date, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

MessageSchema.virtual('time').get(function () {
	return DateTime.fromJSDate(this.timestamp).toLocaleString(
		DateTime.DATETIME_MED,
	);
});

module.exports = mongoose.model('Message', MessageSchema);
