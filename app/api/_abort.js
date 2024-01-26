let sharedValue = 0;

module.exports = {
	getSharedValue: () => sharedValue,
	setSharedValue: (newValue) => { sharedValue = newValue; },
};
