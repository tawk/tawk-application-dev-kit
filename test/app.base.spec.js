'use strict';

require('should');

const fs = require('node:fs');
const path = require('node:path');

function getArgValue(flag) {
	const idx = process.argv.indexOf(flag);
	if (idx === -1) {
		return undefined;
	}
	return process.argv[idx + 1];
}

function resolveAppJsFromDir(dirArg) {
	should.exist(dirArg, 'Missing required argument: --dir <folder-containing-app.js>');

	const dirPath = path.isAbsolute(dirArg) ? dirArg : path.resolve(process.cwd(), dirArg);
	const appJsPath = path.join(dirPath, 'app.js');

	fs.existsSync(dirPath).should.be.true(`Directory not found: ${dirPath}`);
	fs.statSync(dirPath).isDirectory().should.be.true(`Not a directory: ${dirPath}`);
	fs.existsSync(appJsPath).should.be.true(`Missing app.js in directory: ${dirPath}`);

	return appJsPath;
}

function resolveMetadataJsonFromDir(dirArg) {
	should.exist(dirArg, 'Missing required argument: --dir <folder-containing-metadata.json>');

	const dirPath = path.isAbsolute(dirArg) ? dirArg : path.resolve(process.cwd(), dirArg);
	const metadataJsonPath = path.join(dirPath, 'metadata.json');

	fs.existsSync(dirPath).should.be.true(`Directory not found: ${dirPath}`);
	fs.statSync(dirPath).isDirectory().should.be.true(`Not a directory: ${dirPath}`);
	fs.existsSync(metadataJsonPath).should.be.true(`Missing metadata.json in directory: ${dirPath}`);

	return metadataJsonPath;
}

function assertAsset(asset) {
	if (!asset) {
		return;
	}

	(typeof asset).should.equal('object');
	asset.type.should.equal('asset');
	(typeof asset.src).should.equal('string');
	asset.src.should.not.be.empty;
}

describe('example app properties', function () {
	const dirArg = getArgValue('--dir');
	const appJsPath = resolveAppJsFromDir(dirArg);
	const metadataJsonPath = resolveMetadataJsonFromDir(dirArg);

	// eslint-disable-next-line global-require, import/no-dynamic-require
	const AppClass = require(appJsPath);
	const metadata = JSON.parse(fs.readFileSync(metadataJsonPath, 'utf8'));

	it('exports a class/function', function () {
		(typeof AppClass).should.equal('function');
	});

	describe('static properties', function () {
		it('.name should be a string', function () {
			(typeof AppClass.name).should.equal('string');
		});

		it('.categories should be an array', function () {
			(Array.isArray(AppClass.categories)).should.equal(true);
			AppClass.categories.forEach(function (category) {
				['messaging', 'e-commerce', 'cms', 'custom-tool'].should.containEql(category);
			})
		});

		it('.features should be an array', function () {
			(Array.isArray(AppClass.features)).should.equal(true);
			AppClass.features.forEach(function (feature) {
				['toolkit'].should.containEql(feature);
			})
		});

		it('.uiLabels should be an array', function () {
			(Array.isArray(AppClass.uiLabels)).should.equal(true);
			AppClass.uiLabels.should.be.empty;
		});

		it('.singleton should be a boolean', function () {
			(typeof AppClass.singleton).should.equal('boolean');
		});

		it('.configSchema should be an object', function () {
			(typeof AppClass.configSchema).should.equal('object');
		});

		it('.authSchemas should be an object', function () {
			(typeof AppClass.authSchemas).should.equal('object');
		});
	});

	describe('.getConfigSchema', function () {
		it('should return the class configSchema (if implemented/inherited)', function () {
			AppClass.getConfigSchema().should.deepEqual(AppClass.configSchema);
		});
	});

	describe('.getAuthSchemas', function () {
		it('should return the class authSchemas (if implemented/inherited)', function () {
			AppClass.getAuthSchemas().should.deepEqual(AppClass.authSchemas);
		});
	});

	describe('.getClient', function () {
		it('should be a function', function () {
			(typeof AppClass.getClient).should.equal('function');
		});
	});

	describe('.getTools', function () {
		it('should be an optional function', function () {
			if (AppClass.getTools) {
				(typeof AppClass.getTools).should.equal('function');
			}
		});
	});

	describe('.callTool', function () {
		it('should be an optional function', function () {
			if (AppClass.callTool) {
				(typeof AppClass.callTool).should.equal('function');
			}
		});
	});

	describe('metadata.json properties', function () {
		it('should be valid JSON object', function () {
			(typeof metadata).should.equal('object');
			metadata.should.not.equal(null);
		});

		it('should have a content object', function () {
			metadata.should.have.property('content');
			(typeof metadata.content).should.equal('object');
			metadata.content.should.not.equal(null);
		});

		it('content.shortDescription should be a string', function () {
			(typeof metadata.content.shortDescription).should.equal('string');
			metadata.content.shortDescription.should.not.be.empty;
		});

		it('content.vendor.name should be a string', function () {
			metadata.content.should.have.property('vendor');
			metadata.content.vendor.should.have.property('name');
			(typeof metadata.content.vendor.name).should.equal('string');
			metadata.content.vendor.name.should.not.be.empty;
		});

		it('content.overview.content should be a string', function () {
			metadata.content.should.have.property('overview');
			metadata.content.overview.should.have.property('content');
			(typeof metadata.content.overview.content).should.equal('string');
			metadata.content.overview.content.should.not.be.empty;
		});

		it('content.installation should be an array of steps', function () {
			(Array.isArray(metadata.content.installation)).should.equal(true);
			metadata.content.installation.forEach(function (step) {
				(typeof step).should.equal('object');
				step.should.not.equal(null);
				step.should.have.property('title');
				step.should.have.property('description');
				(typeof step.title).should.equal('string');
				(typeof step.description).should.equal('string');

				if (step.images) {
					(Array.isArray(step.images)).should.equal(true);
					step.images.forEach(assertAsset);
				}
			});
		});

		it('content.resources should be an array', function () {
			(Array.isArray(metadata.content.resources)).should.equal(true);
		});

		it('image fields (if present) should use asset objects', function () {
			assertAsset(metadata.content.logoImage);

			if (metadata.content.overview && metadata.content.overview.carouselImages) {
				(Array.isArray(metadata.content.overview.carouselImages)).should.equal(true);
				metadata.content.overview.carouselImages.forEach(assertAsset);
			}
		});
	});
});
