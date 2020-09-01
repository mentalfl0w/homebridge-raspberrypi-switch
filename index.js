'use strict';

var os = require("os");
const exec = require('child_process').exec;
const inherits = require('util').inherits;
const version = require('./package.json').version;
let deviceInfo = {};
let Service;
let Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory('homebridge-raspberrypi-switch', 'pi_switch', pi_switch);
}

function initCustomService() {
	/**
	 * Service "pi_switch" Based on Service.Switch
	 */
	let raspberryPiUUID = '00000049-0000-1000-8000-0026BB765291';
	Service.pi_switch = function (displayName, subType) {
		Service.call(this, displayName, raspberryPiUUID, subType);

		// Required Characteristics
		this.addCharacteristic(Characteristic.On);

		// Optional Characteristics
		this.addOptionalCharacteristic(Characteristic.Name);
	}

	inherits(Service.pi_switch, Service);
	Service.pi_switch.UUID = raspberryPiUUID;
}

function getModel() {

  const { execSync } = require('child_process');
  // stderr is sent to stderr of parent process
  // you can set options.stdio if you want it to go elsewhere
  let stdout = execSync('cat /sys/firmware/devicetree/base/model');
  const data = stdout.toString();
    return data.substring(0, data.length - 1);
};

function pi_switch(log, config) {
    this.log = log;
	this.services = [];
	this.name = config.name || 'Respberry Pi';
	this.os = config.os || 'linux';
    this.serial = config.serial || os.hostname();
	this.operatingState = true;

	initCustomService();

	this.service = new Service.pi_switch(this.name, 'Shutdown');
	this.serviceInfo = new Service.AccessoryInformation();

	this.service
		.getCharacteristic(Characteristic.On)
		.on('get', this.getPowerState.bind(this))
		.on('set', this.setPowerState.bind(this));

	this.serviceInfo
		.setCharacteristic(Characteristic.Manufacturer, 'Raspberry Pi Foundation')
		.setCharacteristic(Characteristic.Model, getModel())
		.setCharacteristic(Characteristic.SerialNumber, this.serial)
		.setCharacteristic(Characteristic.FirmwareRevision, version);

	this.services.push(this.service);
	this.services.push(this.serviceInfo);

    this.rebootService = new Service.Switch(this.name + ' Reboot', 'Reboot');

    this.rebootService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getRebootState.bind(this))
        .on('set', this.setRebootState.bind(this));

    this.services.push(this.rebootService);
	
}

pi_switch.prototype = {

	getPowerState: function (callback) {
		callback(null, this.operatingState);
	},

	setPowerState: function (state, callback) {
		if (!this.operatingState) {
			return;
		}

		const that = this;
		
		exec('sudo shutdown -h now', function (error, stdout, stderr) {
			if (error) {
                that.log(error);
			} else {
				that.operatingState = false;
				
                that.log.debug('operating state: %s', that.operatingState);

				callback(null, that.operatingState);
			}
		});
	},

	getRebootState: function (callback) {
		if (!this.operatingState) {
			return;
		}

		callback(null, !this.operatingState);
	},

	setRebootState: function (state, callback) {
		if (!this.operatingState) {
			return;
		}

		const that = this;
		
		exec('sudo reboot', function (error, stdout, stderr) {
			if (error) {
                that.log(error);
			} else {
				that.operatingState = false;
				
                that.log.debug('operating state: %s', that.operatingState);

				callback(null, that.operatingState);
			}
		});
	},

	identify: function (callback) {
		callback();
	},

	getServices: function () {
		return this.services;
	}
};
