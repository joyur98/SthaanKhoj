/**
 * One-time script to promote the designated admin email.
 * Run: node scripts/bootstrapAdmin.js
 */
import dotenv from "dotenv";
import { auth, db } from "../firebase/firebaseAdmin.js";
import {
  DESIGNATED_ADMIN_EMAIL,
  ensureDesignatedAdminAccount,
  promoteDesignatedAdmin,
} from "../services/adminBootstrap.js";

dotenv.config();

async function main() {
  console.log(`Setting up admin account: ${DESIGNATED_ADMIN_EMAIL}`);

  const { uid, email, created, passwordReset } = await ensureDesignatedAdminAccount();
  if (created) {
    console.log(`\n✅ Created Firebase account for ${DESIGNATED_ADMIN_EMAIL} (uid: ${uid})`);
    console.log("   Default password is used — change ADMIN_PASSWORD in .env for production.\n");
  } else if (passwordReset) {
    console.log(`\n✅ Reset password for ${DESIGNATED_ADMIN_EMAIL} (uid: ${uid})\n`);
  }

  const result = await promoteDesignatedAdmin(uid, email);
  if (result.promoted) {
    console.log(`\n✅ Promoted ${DESIGNATED_ADMIN_EMAIL} to admin (uid: ${uid})`);
    console.log("Log in at /login with the Admin role tab.\n");
  } else {
    console.log(`\n✅ ${DESIGNATED_ADMIN_EMAIL} is already an admin (uid: ${uid})\n`);
  }

  const adminDoc = await db.collection("admins").doc(uid).get();
  if (adminDoc.exists) {
    console.log("Admin profile:", adminDoc.data());
  }
}

main().catch((err) => {
  console.error("Bootstrap failed:", err.message);
  process.exit(1);
});
