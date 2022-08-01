import { AWS } from './aws-services';

/**
 * KMS Class
 * **/
export default class KMS {
  private _logger: any;

  /**
   * @param {Object} {
   *     logger: Object
   * }
   * **/
  constructor({ logger }: { logger: any }) {
    this._logger = logger;
  }

  /**
   * encrypts the cleartext using KMS
   * @param {String} keyId (Required)
   * @param {String} cleartext (Required)
   * @return {Promise} encrypted cleartext
   */
  encrypt(keyId: string, cleartext: string) {
    this._logger.debug(`Method`, `KMS encrypt()`);
    return new Promise((resolve, reject) => {
      if (!keyId) {
        return reject(new Error(`KMS Encrypt: keyId is undefined`));
      } else if (typeof keyId !== `string`) {
        return reject(new Error(`KMS Encrypt: Invalid keyId type`));
      } else if (!cleartext) {
        return reject(new Error(`KMS Encrypt: cleartext is undefined`));
      } else if (typeof cleartext !== `string`) {
        return reject(new Error(`KMS Encrypt: Invalid cleartext type`));
      }

      const kms = new AWS.KMS({ region: `us-east-1` });
      const params = {
        KeyId: keyId,
        Plaintext: cleartext
      };
      kms.encrypt(params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          const base64EncryptedString = data.CiphertextBlob.toString(`base64`);
          resolve(base64EncryptedString);
        }
      });
    });
  }

  /**
   * decrypts the ciphertext using KMS
   * @param {String} ciphertext (Required)
   * @return {Promise} decrypted ciphertext
   */
  decrypt(ciphertext: string) {
    this._logger.debug(`Method`, `KMS decrypt()`);
    return new Promise((resolve, reject) => {
      if (!ciphertext) {
        return reject(new Error(`KMS Decrypt: ciphertext is undefined`));
      } else if (typeof ciphertext !== `string`) {
        return reject(new Error(`KMS Decrypt: Invalid ciphertext type`));
      }

      const kms = new AWS.KMS({ region: `us-east-1` });
      kms.decrypt({
        CiphertextBlob: new Buffer(ciphertext, `base64`)
      }, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Plaintext.toString(`ascii`));
        }
      });
    });
  }
}
