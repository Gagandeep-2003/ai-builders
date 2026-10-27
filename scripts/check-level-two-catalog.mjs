import { readFileSync } from "node:fs";

const CATALOG_URL = new URL(
  "../data/level-two-curriculum.json",
  import.meta.url,
);
const GOOGLE_DOC_URL =
  /^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+\/edit(?:\?.*)?$/;
const GOOGLE_DRIVE_FOLDER_URL =
  /^https:\/\/drive\.google\.com\/drive\/folders\/[A-Za-z0-9_-]+(?:\?.*)?$/;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateCatalog(catalog) {
  assert(catalog.level === 2, "Catalog level must be 2.");
  assert(Array.isArray(catalog.modules), "Catalog modules must be an array.");
  assert(catalog.modules.length === 3, "Catalog must contain exactly 3 modules.");

  const activityIds = new Set();
  const documentUrls = new Set();
  const documentIds = new Set();
  let sessionCount = 0;
  let activityCount = 0;

  for (const [moduleIndex, module] of catalog.modules.entries()) {
    const moduleNumber = moduleIndex + 1;

    assert(
      module.number === moduleNumber,
      `Module ${moduleNumber} is out of order or has the wrong number.`,
    );
    assert(
      module.id === `l2-m${moduleNumber}`,
      `Module ${moduleNumber} has an unstable id.`,
    );
    assert(
      Array.isArray(module.sessions) && module.sessions.length === 8,
      `Module ${moduleNumber} must contain exactly 8 sessions.`,
    );

    for (const [sessionIndex, session] of module.sessions.entries()) {
      const sessionNumber = sessionIndex + 1;
      const sessionLabel = `Module ${moduleNumber}, session ${sessionNumber}`;

      sessionCount += 1;
      assert(
        session.number === sessionNumber,
        `${sessionLabel} is out of order or has the wrong number.`,
      );
      assert(
        session.id === `l2-m${moduleNumber}-s${sessionNumber}`,
        `${sessionLabel} has an unstable id.`,
      );
      assert(
        GOOGLE_DRIVE_FOLDER_URL.test(session.folder_url),
        `${sessionLabel} has an invalid Google Drive folder URL.`,
      );
      assert(
        Array.isArray(session.activities) && session.activities.length === 4,
        `${sessionLabel} must contain exactly 4 activities.`,
      );

      const classChallenges = session.activities.filter(
        (activity) => activity.kind === "class_challenge",
      );
      const homeTasks = session.activities.filter(
        (activity) => activity.kind === "home_task",
      );

      assert(
        classChallenges.length === 2,
        `${sessionLabel} must contain exactly 2 class challenges.`,
      );
      assert(
        homeTasks.length === 2,
        `${sessionLabel} must contain exactly 2 home tasks.`,
      );

      for (const [activityIndex, activity] of session.activities.entries()) {
        const expectedSlots = [
          { kind: "class_challenge", number: 1, sourcePrefix: "01_CA_", title: "Class Activity 1" },
          { kind: "class_challenge", number: 2, sourcePrefix: "02_CA_", title: "Class Activity 2" },
          { kind: "home_task", number: 1, sourcePrefix: "03_HT_", title: "Home Task 1" },
          { kind: "home_task", number: 2, sourcePrefix: "04_HT_", title: "Home Task 2" },
        ];
        const expectedSlot = expectedSlots[activityIndex];
        const prefix = activity.kind === "class_challenge" ? "cc" : "ht";
        const expectedId = `l2-m${moduleNumber}-s${sessionNumber}-${prefix}${activity.number}`;
        const documentIdMatch = activity.document_url.match(
          /^https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)\/edit(?:\?.*)?$/,
        );

        activityCount += 1;
        assert(
          activity.kind === expectedSlot.kind && activity.number === expectedSlot.number,
          `${sessionLabel}, activity ${activityIndex + 1} must be ${expectedSlot.kind} ${expectedSlot.number}.`,
        );
        assert(
          activity.order === activityIndex + 1,
          `${activity.id} has the wrong activity order.`,
        );
        assert(activity.id === expectedId, `${activity.id} should be ${expectedId}.`);
        assert(!activityIds.has(activity.id), `Duplicate activity id: ${activity.id}.`);
        assert(
          GOOGLE_DOC_URL.test(activity.document_url),
          `${activity.id} has an invalid Google Docs URL.`,
        );
        assert(
          documentIdMatch?.[1] === activity.document_id,
          `${activity.id} document_id does not match its Google Docs URL.`,
        );
        assert(
          !documentUrls.has(activity.document_url),
          `Duplicate document URL: ${activity.document_url}.`,
        );
        assert(
          !documentIds.has(activity.document_id),
          `Duplicate document id: ${activity.document_id}.`,
        );
        assert(
          activity.source_name.startsWith(expectedSlot.sourcePrefix),
          `${activity.id} source_name must start with ${expectedSlot.sourcePrefix}.`,
        );
        assert(
          activity.document_title.startsWith(
            `Session ${sessionNumber} ${expectedSlot.title}`,
          ),
          `${activity.id} has a mismatched document title.`,
        );
        assert(
          Array.isArray(activity.instructions) && activity.instructions.length > 0,
          `${activity.id} must contain an instructions array.`,
        );

        activityIds.add(activity.id);
        documentUrls.add(activity.document_url);
        documentIds.add(activity.document_id);
      }
    }
  }

  assert(sessionCount === 24, "Catalog must contain exactly 24 sessions.");
  assert(activityCount === 96, "Catalog must contain exactly 96 activities.");
  assert(activityIds.size === 96, "Catalog must contain 96 unique activity ids.");
  assert(
    documentUrls.size === 96,
    "Catalog must contain 96 unique document URLs.",
  );
  assert(documentIds.size === 96, "Catalog must contain 96 unique document ids.");

  return { moduleCount: catalog.modules.length, sessionCount, activityCount };
}

try {
  const catalog = JSON.parse(readFileSync(CATALOG_URL, "utf8"));
  const result = validateCatalog(catalog);

  console.log(
    `Validated Level 2 catalog: ${result.moduleCount} modules, ${result.sessionCount} sessions, ${result.activityCount} activities.`,
  );
} catch (error) {
  console.error(`Level 2 catalog validation failed: ${error.message}`);
  process.exitCode = 1;
}
