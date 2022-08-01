const { expect } = require(`chai`);
const sinon = require(`sinon`);
const rewire = require(`rewire`);
const Logger = require(`@mawhea/module-winston-logger`);
const logger = new Logger({});

/**
 * Stubs
 * **/
const AWS = sinon.stub();
logger.debug = sinon.fake();
logger.info = sinon.fake();
logger.warn = sinon.fake();
logger.error = sinon.fake();

/**
 * Reset history of all logger methods
 * **/
function resetLoggerHistory() {
   logger.debug.resetHistory();
   logger.info.resetHistory();
   logger.warn.resetHistory();
   logger.error.resetHistory();
}

/**
 * Rewire
 * **/
const KMS = rewire(`../../lib/kms.js`);

describe(`KMS Unit Tests`, function() {
   afterEach(function() {
      resetLoggerHistory();
   });
   describe(`decrypt()`, function() {
      it(`should fail if ciphertext is falsy`, function() {
         const kms = new KMS({ logger });
         return kms.decrypt(``).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS decrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Decrypt: ciphertext is undefined`);
         });
      });

      it(`should fail if ciphertext is not a string`, function() {
         const kms = new KMS({ logger });
         return kms.decrypt(1).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS decrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Decrypt: Invalid ciphertext type`);
         });
      });

      it(`should reject if the KMS API fails`, function() {
         AWS.KMS = class {
            /** Stub constructor **/
            constructor() {
            }

            /**
             * Stub decrypt method
             * Executes the callback
             * @param {String} ciphertext
             * @param {Function} callback
             * **/
            decrypt(ciphertext, callback) {
               callback({ message: `AWS KMS API failed` });
            }
         };
         KMS.__set__(`AWS`, AWS);
         const kms = new KMS({ logger });
         return kms.decrypt(`test`).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS decrypt()`);

            expect(error.message).to.equal(`AWS KMS API failed`);
         });
      });

      it(`should decrypt ciphertext`, function() {
         AWS.KMS = class {
            /** Stub constructor **/
            constructor() {
            }

            /**
             * Stub decrypt method
             * Executes the callback
             * @param {String} ciphertext
             * @param {Function} callback
             * **/
            decrypt(ciphertext, callback) {
               callback(null, { Plaintext: `*2f0*V4vAM1ke7*` });
            }
         };
         KMS.__set__(`AWS`, AWS);
         const kms = new KMS({ logger });
         return kms.decrypt(`test`).then((response) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS decrypt()`);

            expect(response).to.equal(`*2f0*V4vAM1ke7*`);
         });
      });
   });

   describe(`encrypt()`, function() {
      it(`should fail if keyId is falsy`, function() {
         const kms = new KMS({ logger });
         return kms.encrypt(``, ``).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Encrypt: keyId is undefined`);
         });
      });

      it(`should fail if keyId is not a string`, function() {
         const kms = new KMS({ logger });
         return kms.encrypt(1234, ``).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Encrypt: Invalid keyId type`);
         });
      });

      it(`should fail if cleartext is falsy`, function() {
         const kms = new KMS({ logger });
         return kms.encrypt(`1234`, ``).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Encrypt: cleartext is undefined`);
         });
      });

      it(`should fail if cleartext is not a string`, function() {
         const kms = new KMS({ logger });
         return kms.encrypt(`1234`, 5678).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(error).to.exist;
            expect(error.message).to.equal(`KMS Encrypt: Invalid cleartext type`);
         });
      });

      it(`should reject if the KMS API fails`, function() {
         AWS.KMS = class {
            /** Stub constructor **/
            constructor() {
            }

            /**
             * Stub encrypt method
             * Executes the callback
             * @param {{KeyId: String, Plaintext: String}} params
             * @param {Function} callback
             * **/
            encrypt({ KeyId, Plaintext }, callback) {
               callback({ message: `AWS KMS API failed` });
            }
         };
         KMS.__set__(`AWS`, AWS);
         const kms = new KMS({ logger });
         return kms.encrypt(`1234`, `5678`).catch((error) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(error.message).to.equal(`AWS KMS API failed`);
         });
      });

      it(`should decrypt ciphertext`, function() {
         AWS.KMS = class {
            /** Stub constructor **/
            constructor() {
            }

            /**
             * Stub encrypt method
             * Executes the callback
             * @param {{KeyId: String, Plaintext: String}} params
             * @param {Function} callback
             * **/
            encrypt({ KeyId, Plaintext }, callback) {
               callback(null, { CiphertextBlob: `base64EncodedString` });
            }
         };
         KMS.__set__(`AWS`, AWS);
         const kms = new KMS({ logger });
         return kms.encrypt(`1234`, `5678`).then((response) => {
            expect(logger.debug.called).to.be.true;
            expect(logger.info.called).to.be.false;
            expect(logger.warn.called).to.be.false;
            expect(logger.error.called).to.be.false;

            expect(logger.debug.getCalls().length).to.equal(1);
            expect(logger.debug.getCalls()[0].args[0]).to.equal(`Method`);
            expect(logger.debug.getCalls()[0].args[1]).to.equal(`KMS encrypt()`);

            expect(response).to.equal(`base64EncodedString`);
         });
      });
   });
});
