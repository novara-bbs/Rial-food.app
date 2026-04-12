#!/usr/bin/env node
/**
 * Post-`cap add ios` setup script.
 *
 * Copies required iOS assets (PrivacyInfo.xcprivacy) to the correct
 * Xcode project location and patches the .xcodeproj to include them.
 *
 * Usage:
 *   npm run cap:setup:ios
 *   (which runs: npx cap add ios && node scripts/setup-ios.mjs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ─── Copy PrivacyInfo.xcprivacy ───────────────────────────────────────────────

const src = path.join(ROOT, 'resources', 'ios', 'PrivacyInfo.xcprivacy');
const dest = path.join(ROOT, 'ios', 'App', 'App', 'PrivacyInfo.xcprivacy');

if (!fs.existsSync(path.join(ROOT, 'ios'))) {
  console.error('❌  ios/ folder not found. Run `npx cap add ios` first.');
  process.exit(1);
}

if (!fs.existsSync(src)) {
  console.error('❌  resources/ios/PrivacyInfo.xcprivacy not found.');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('✅  Copied PrivacyInfo.xcprivacy → ios/App/App/PrivacyInfo.xcprivacy');

// ─── Patch .xcodeproj to include the file ─────────────────────────────────────

const pbxprojPath = path.join(ROOT, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');

if (!fs.existsSync(pbxprojPath)) {
  console.warn('⚠️   App.xcodeproj not found — skipping Xcode project patch.');
  console.warn('    You must manually add PrivacyInfo.xcprivacy to the Xcode project.');
  process.exit(0);
}

let pbxproj = fs.readFileSync(pbxprojPath, 'utf-8');

// Check if PrivacyInfo.xcprivacy is already in the project
if (pbxproj.includes('PrivacyInfo.xcprivacy')) {
  console.log('✅  PrivacyInfo.xcprivacy already in Xcode project.');
  process.exit(0);
}

// Generate deterministic UUIDs for Xcode (Xcode uses 24-char hex strings)
const FILE_REF_UUID  = 'RIAL000000000001PRIVACYREF';
const BUILD_FILE_UUID = 'RIAL000000000002PRIVACYBLD';

// 1. Add PBXFileReference entry
const fileRefAnchor = '/* Begin PBXFileReference section */';
const fileRefEntry = `\t\t${FILE_REF_UUID} /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };`;
pbxproj = pbxproj.replace(fileRefAnchor, `${fileRefAnchor}\n${fileRefEntry}`);

// 2. Add PBXBuildFile entry (for Resources build phase)
const buildFileAnchor = '/* Begin PBXBuildFile section */';
const buildFileEntry = `\t\t${BUILD_FILE_UUID} /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = ${FILE_REF_UUID} /* PrivacyInfo.xcprivacy */; };`;
pbxproj = pbxproj.replace(buildFileAnchor, `${buildFileAnchor}\n${buildFileEntry}`);

// 3. Add to the App group children (find the App group)
const groupChildrenRegex = /(\/\* App \*\/ = \{[^}]*?children = \()/s;
pbxproj = pbxproj.replace(groupChildrenRegex, (match) => {
  return match + `\n\t\t\t\t${FILE_REF_UUID} /* PrivacyInfo.xcprivacy */,`;
});

// 4. Add to Resources build phase
const resourcesPhaseRegex = /(\/\* Resources \*\/[^}]*?files = \()/s;
pbxproj = pbxproj.replace(resourcesPhaseRegex, (match) => {
  return match + `\n\t\t\t\t${BUILD_FILE_UUID} /* PrivacyInfo.xcprivacy in Resources */,`;
});

fs.writeFileSync(pbxprojPath, pbxproj, 'utf-8');
console.log('✅  Patched App.xcodeproj to include PrivacyInfo.xcprivacy');
console.log('');
console.log('📱  Next steps:');
console.log('    1. Open Xcode: npm run cap:ios');
console.log('    2. Verify PrivacyInfo.xcprivacy appears in the file navigator');
console.log('    3. Archive and upload to App Store Connect');
