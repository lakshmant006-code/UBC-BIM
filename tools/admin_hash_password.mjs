// Makes the two secret values the admin sign-in needs. Run it on your own
// computer, paste the output into the host's environment variables
// (ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET), and never commit them.
//
//   node tools/admin_hash_password.mjs
//
// It asks for the password on the terminal, so it doesn't end up in your
// shell history.
import { scryptSync, randomBytes } from 'node:crypto';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Choose the admin password (12+ characters): ', (pw) => {
  rl.close();
  if (pw.length < 12) { console.error('\nUse at least 12 characters.'); process.exit(1); }
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  console.log('\nADMIN_PASSWORD_HASH=scrypt$' + salt.toString('hex') + '$' + hash.toString('hex'));
  console.log('ADMIN_SESSION_SECRET=' + randomBytes(48).toString('base64url'));
  console.log('ADMIN_EMAIL=<the admin email address>\n');
});
