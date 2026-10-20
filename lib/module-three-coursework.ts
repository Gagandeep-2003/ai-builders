import type { CourseworkSession } from "@/lib/coursework-details";

const MODULE_TITLE = "Automation Studio: n8n Workflows";

export const moduleThreeN8nCoursework: CourseworkSession[] = [
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 1,
    sessionTitle: "Meet n8n: Your First Workflow",
    whatStudentsLearn:
      "Students learn what a workflow is, how n8n moves data between nodes, and how to run and inspect a simple manual workflow.",
    tools: ["n8n"],
    aiType: "Workflow Foundations",
    tasks: [
      {
        type: "class_challenge",
        title: "Build Your First n8n Workflow",
        description:
          "Create a tiny workflow with a Manual Trigger and an Edit Fields node. Run it once and inspect the output.",
        googleDocLink: "internal://module3-n8n/m3s1/class-challenge",
        mission: "Understand the n8n canvas by building and running a two-node workflow.",
        scenario:
          "You want n8n to create a simple welcome message automatically instead of typing it each time.",
        instructions: [
          "Open n8n and create a new workflow.",
          "Add a Manual Trigger node.",
          "Add an Edit Fields node and connect it to the trigger.",
          "Create fields for your name and a short welcome message.",
          "Run the workflow and inspect the output panel.",
        ],
        deliverables: ["A working two-node workflow", "A screenshot of the successful output"],
        checklist: [
          "The two nodes are connected.",
          "The workflow runs without an error.",
          "The output contains your name and message.",
        ],
      },
      {
        type: "home_task",
        title: "Daily Goal Generator",
        description:
          "Build a simple n8n workflow that produces your name, one learning goal, and today's practice reminder.",
        googleDocLink: "internal://module3-n8n/m3s1/home-task",
        mission: "Repeat the basic n8n workflow pattern independently.",
        scenario:
          "A personal reminder workflow will prepare a short learning goal whenever you run it.",
        instructions: [
          "Create a new n8n workflow with a Manual Trigger.",
          "Add an Edit Fields node.",
          "Add fields named student, goal, and reminder.",
          "Run the workflow and confirm all three values appear.",
          "Save the workflow with a clear name.",
        ],
        deliverables: ["Saved Daily Goal workflow", "Screenshot of the final output"],
        checklist: ["The workflow runs successfully.", "All three fields appear.", "The workflow has a clear name."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 2,
    sessionTitle: "Connect Google Tools Safely",
    whatStudentsLearn:
      "Students learn what credentials and APIs are, how to enable a Google API, configure OAuth consent, and connect a Google account to n8n safely.",
    tools: ["n8n"],
    aiType: "Credentials & Google APIs",
    tasks: [
      {
        type: "class_challenge",
        title: "Connect Google Sheets to n8n",
        description:
          "Prepare a Google Cloud project, enable the Sheets API, and create a reusable Google Sheets credential in n8n.",
        googleDocLink: "internal://module3-n8n/m3s2/class-challenge",
        mission: "Connect n8n to Google Sheets without sharing private keys or passwords.",
        scenario:
          "Your future automations need permission to read and update a spreadsheet, so you must create a secure connection first.",
        instructions: [
          "Create or select a Google Cloud project.",
          "Enable the Google Sheets API and Google Drive API.",
          "Configure the OAuth consent screen with the required basic details.",
          "Create an OAuth client and use n8n's redirect URL.",
          "Add the client details to an n8n Google Sheets credential and sign in.",
          "Test the credential with a simple spreadsheet read operation.",
        ],
        deliverables: ["Connected Google Sheets credential", "Successful test result"],
        checklist: [
          "The required APIs are enabled.",
          "The redirect URL matches n8n.",
          "The credential test succeeds.",
          "No secret or private key is included in the submission.",
        ],
      },
      {
        type: "home_task",
        title: "Google Connection Checklist",
        description:
          "Create a test spreadsheet and use n8n to read one row from it using the credential created in class.",
        googleDocLink: "internal://module3-n8n/m3s2/home-task",
        mission: "Confirm that your Google connection is ready for later projects.",
        scenario:
          "Before building a larger automation, you need a small test that proves the connection works reliably.",
        instructions: [
          "Create a Google Sheet with columns Name and Status.",
          "Add one sample row.",
          "Create an n8n workflow with a Manual Trigger and Google Sheets node.",
          "Read the sample row and inspect the output.",
          "Save a screenshot that does not expose credentials.",
        ],
        deliverables: ["Test spreadsheet", "Working read workflow", "Safe screenshot of the output"],
        checklist: ["The row is returned by n8n.", "No credentials are visible.", "The workflow is saved."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 3,
    sessionTitle: "Quiz Champion",
    whatStudentsLearn:
      "Students build an n8n form workflow, use an IF node for a simple score decision, save results to Google Sheets, and send a result message.",
    tools: ["n8n"],
    aiType: "Forms & Branching",
    tasks: [
      {
        type: "class_challenge",
        title: "Build Quiz Champion",
        description:
          "Create a quiz form that checks whether the score is 7 or higher, labels the result, saves it to Google Sheets, and sends a message.",
        googleDocLink: "internal://module3-n8n/m3s3/class-challenge",
        mission: "Build your first useful form workflow with a true and false path.",
        scenario:
          "A teacher wants every quiz response recorded and each student to receive a friendly result message automatically.",
        instructions: [
          "Create an n8n Form Trigger with name, email, and score fields.",
          "Add an IF node that checks whether the score is at least 7.",
          "Set the true result to Quiz Champion and the false result to Future Champion.",
          "Merge or route both results into a Google Sheets row.",
          "Add a final form message or email with the result.",
          "Test once with a high score and once with a low score.",
        ],
        deliverables: ["Working quiz form", "Both decision paths tested", "Results saved in Google Sheets"],
        checklist: [
          "The IF condition uses 7 as the boundary.",
          "Both paths produce the correct label.",
          "The submitted result reaches the spreadsheet.",
        ],
      },
      {
        type: "home_task",
        title: "Reading Challenge Checker",
        description:
          "Adapt Quiz Champion into a reading challenge form that labels 5 or more books as Reading Star and anything lower as Rising Reader.",
        googleDocLink: "internal://module3-n8n/m3s3/home-task",
        mission: "Reuse the same branching pattern for a relatable new scenario.",
        scenario:
          "A library wants to celebrate students based on how many books they completed this month.",
        instructions: [
          "Create a form with name, email, and books read.",
          "Use an IF node to check whether books read is at least 5.",
          "Create the labels Reading Star and Rising Reader.",
          "Save each result to a Google Sheet.",
          "Show the correct result after submission and test both paths.",
        ],
        deliverables: ["Reading challenge workflow", "Two test submissions", "Spreadsheet result rows"],
        checklist: ["Both branches work.", "Each result is saved.", "The final message matches the branch."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 4,
    sessionTitle: "Sheets to Gmail: Formatted HTML",
    whatStudentsLearn:
      "Students process a new Google Sheets row, prepare clean data, send a formatted HTML email through Gmail, and mark the row as sent.",
    tools: ["n8n"],
    aiType: "Data Processing & Email",
    tasks: [
      {
        type: "class_challenge",
        title: "Sheet Submission Emailer",
        description:
          "Build a workflow that reads a new spreadsheet row, prepares its values, sends a clear HTML email, and records the sent status.",
        googleDocLink: "internal://module3-n8n/m3s4/class-challenge",
        mission: "Turn spreadsheet data into a useful, formatted email automatically.",
        scenario:
          "A club records registrations in Google Sheets and needs a readable confirmation email for each new row.",
        instructions: [
          "Create a sheet with Name, Email, Topic, and Email Status columns.",
          "Use the Google Sheets trigger for a new row.",
          "Prepare the submitted values with an Edit Fields or Code node.",
          "Create a simple HTML email with a heading, labels, and readable spacing.",
          "Send the message with Gmail.",
          "Update the same row to mark Email Status as Sent.",
        ],
        deliverables: ["Working Sheets-to-Gmail workflow", "Formatted test email", "Updated Sent status"],
        checklist: ["The correct row triggers the workflow.", "The email is readable.", "The row is marked Sent only after email success."],
      },
      {
        type: "home_task",
        title: "Event Registration Confirmation",
        description:
          "Adapt the class workflow to email an HTML event confirmation containing the attendee name, event, date, and a short preparation note.",
        googleDocLink: "internal://module3-n8n/m3s4/home-task",
        mission: "Practice reliable spreadsheet processing with a new formatted email.",
        scenario:
          "An event organiser wants every registration to receive an attractive confirmation without replying manually.",
        instructions: [
          "Create suitable event registration columns in Google Sheets.",
          "Trigger the workflow from a new row.",
          "Build a compact HTML confirmation card.",
          "Send it to the test attendee email.",
          "Update the row with Sent and the current date or time.",
        ],
        deliverables: ["Event confirmation workflow", "Received HTML email", "Updated spreadsheet row"],
        checklist: ["All event details are correct.", "The email has clear formatting.", "The status update works."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 5,
    sessionTitle: "AI Story Generator",
    whatStudentsLearn:
      "Students send structured form data to Gemini from n8n, prepare a controlled prompt, extract the response, save it, and email the final result.",
    tools: ["n8n"],
    aiType: "Generative AI Workflows",
    tasks: [
      {
        type: "class_challenge",
        title: "AI Adventure Story Generator",
        description:
          "Create a form-driven n8n workflow that asks Gemini for a short adventure story, saves it to Google Sheets, and emails it to the student.",
        googleDocLink: "internal://module3-n8n/m3s5/class-challenge",
        mission: "Connect a controlled AI prompt to a complete n8n automation.",
        scenario:
          "A young reader chooses a hero, location, and theme and receives a personalised story by email.",
        instructions: [
          "Create an n8n form for name, email, hero, location, and story theme.",
          "Prepare a short prompt with a clear length and child-friendly tone.",
          "Send the prompt to Gemini using the approved credential or API request.",
          "Extract only the generated story text.",
          "Save the request and story in Google Sheets.",
          "Email the formatted story and test the complete workflow.",
        ],
        deliverables: ["Story request form", "Generated story", "Saved row", "Received story email"],
        checklist: ["The prompt uses all form choices.", "The story is extracted cleanly.", "The complete workflow runs once without manual repair."],
      },
      {
        type: "home_task",
        title: "AI Mini Website Generator",
        description:
          "Adapt the story workflow so Gemini creates a small single-page HTML website from a topic, audience, and colour choice, then emails the code.",
        googleDocLink: "internal://module3-n8n/m3s5/home-task",
        mission: "Reuse a generative workflow for a practical creative output.",
        scenario:
          "A student wants a starter website and provides only the topic, intended audience, and preferred colour.",
        instructions: [
          "Create a form for email, website topic, audience, and preferred colour.",
          "Prompt Gemini to return one simple HTML document with embedded CSS.",
          "Ask for a heading, short introduction, three feature points, and a call to action.",
          "Extract and save the generated code.",
          "Email the code in a readable format and test it in a browser.",
        ],
        deliverables: ["Website request form", "Generated HTML/CSS", "Saved output", "Received email"],
        checklist: ["The page opens in a browser.", "The requested colour and topic are used.", "The workflow does not expose an API key."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 6,
    sessionTitle: "Streamlit Foundations",
    whatStudentsLearn:
      "Students understand how Streamlit turns a Python file into a simple app and practise inputs, buttons, messages, and session-friendly page structure.",
    tools: ["n8n"],
    aiType: "Simple App Interfaces",
    tasks: [
      {
        type: "class_challenge",
        title: "Build a Streamlit Input App",
        description:
          "Create a small Streamlit page with a title, text input, option selector, button, and a result message that will later connect to n8n.",
        googleDocLink: "internal://module3-n8n/m3s6/class-challenge",
        mission: "Learn the basic interface pieces needed for an n8n front end.",
        scenario:
          "Your workflows are useful, but a simple web interface will make them easier for other people to use.",
        instructions: [
          "Create a Streamlit Python file and add a page title.",
          "Add a name text input and one select box.",
          "Add a button labelled Send to workflow.",
          "When clicked, show the entered values in a success message.",
          "Run the app locally and confirm it updates correctly.",
        ],
        deliverables: ["Running Streamlit app", "Input controls", "Result message"],
        checklist: ["The app loads without an error.", "The button reads the current inputs.", "The layout is clear and compact."],
      },
      {
        type: "home_task",
        title: "Study Request Interface",
        description:
          "Build a Streamlit form where a student enters a subject, topic, and difficulty and receives a clean request summary.",
        googleDocLink: "internal://module3-n8n/m3s6/home-task",
        mission: "Practise creating a useful front end before adding automation.",
        scenario:
          "A learner needs a simple screen for requesting practice material from a future n8n workflow.",
        instructions: [
          "Add subject and topic text inputs.",
          "Add an Easy, Medium, or Hard selector.",
          "Place the controls inside a Streamlit form.",
          "Show a formatted summary after submission.",
          "Add one friendly validation message for missing information.",
        ],
        deliverables: ["Study request app", "Validation message", "Submitted request summary"],
        checklist: ["The form submits once.", "Missing information is handled.", "The summary includes every input."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 7,
    sessionTitle: "Streamlit Meets n8n",
    whatStudentsLearn:
      "Students connect a Streamlit form to an n8n webhook, send JSON, receive a response, and show success and error states in the app.",
    tools: ["n8n"],
    aiType: "Webhooks & App Integration",
    tasks: [
      {
        type: "class_challenge",
        title: "Connect Streamlit to an n8n Webhook",
        description:
          "Send a small request from Streamlit to an n8n webhook and display the workflow response in the app.",
        googleDocLink: "internal://module3-n8n/m3s7/class-challenge",
        mission: "Connect a friendly interface to a real automation endpoint.",
        scenario:
          "A user submits a study topic in Streamlit and n8n returns a confirmation message with the received values.",
        instructions: [
          "Create an n8n Webhook node that accepts a POST request.",
          "Add a Respond to Webhook node with a simple JSON message.",
          "Send the Streamlit form values with a Python POST request.",
          "Show the returned message in Streamlit.",
          "Add loading, success, and error feedback.",
          "Test using the correct test or production webhook URL.",
        ],
        deliverables: ["Working n8n webhook", "Connected Streamlit form", "Visible response message"],
        checklist: ["The payload reaches n8n.", "The response returns to Streamlit.", "Errors do not leave the user without feedback."],
      },
      {
        type: "home_task",
        title: "Homework Reminder Request App",
        description:
          "Create a Streamlit form that sends a homework reminder request to n8n and returns a confirmation with the subject and due date.",
        googleDocLink: "internal://module3-n8n/m3s7/home-task",
        mission: "Practise the same app-to-webhook pattern with new data.",
        scenario:
          "A student submits a subject and due date, and n8n confirms that the reminder request was received.",
        instructions: [
          "Build a Streamlit form for subject, task, and due date.",
          "POST the values as JSON to an n8n webhook.",
          "Prepare a confirmation message in n8n.",
          "Return the confirmation to Streamlit.",
          "Display a spinner while waiting and a useful error if the request fails.",
        ],
        deliverables: ["Reminder request interface", "Webhook workflow", "Success and error states"],
        checklist: ["All form values arrive in n8n.", "The response is readable.", "The app remains usable after an error."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: MODULE_TITLE,
    sessionNumber: 8,
    sessionTitle: "Personal Assistant Capstone",
    whatStudentsLearn:
      "Students assemble a personal assistant workflow with an n8n agent, selected tools, memory, a webhook interface, safe testing, and a final demonstration.",
    tools: ["n8n"],
    aiType: "Agentic Automation Capstone",
    tasks: [
      {
        type: "class_challenge",
        title: "Build the Personal Assistant Core",
        description:
          "Create the core personal assistant workflow with an input trigger, AI agent, memory, selected tools, and a clear response path.",
        googleDocLink: "internal://module3-n8n/m3s8/class-challenge",
        mission: "Combine the module skills into one organised and safe assistant workflow.",
        scenario:
          "Your assistant should understand a request and use only the tools you intentionally connect, such as calendar, Gmail, notes, or expense tracking.",
        instructions: [
          "Choose two or three assistant capabilities to demonstrate.",
          "Create a form or webhook input and connect it to an AI Agent.",
          "Add a chat model and simple memory.",
          "Connect only the tools required for your chosen capabilities.",
          "Add a response node and clear error handling.",
          "Test each capability separately before the final demonstration.",
        ],
        deliverables: ["Working assistant core", "At least two tested capabilities", "Workflow demonstration"],
        checklist: ["Every connected tool has a clear purpose.", "The assistant returns a response.", "Tests use safe sample data.", "No credentials appear in the submission."],
      },
      {
        type: "home_task",
        title: "Personal Assistant Upgrade",
        description:
          "Add two useful improvements to the capstone, such as one new tool, clearer Streamlit controls, better memory, validation, or improved error messages.",
        googleDocLink: "internal://module3-n8n/m3s8/home-task",
        mission: "Polish the capstone into a reliable assistant you can confidently showcase.",
        scenario:
          "The first version works, but a strong final project needs clearer controls, safer behaviour, and one or two personal touches.",
        instructions: [
          "Review the class version and list two improvements.",
          "Add one new capability or meaningfully improve an existing capability.",
          "Add validation or an error message for one likely failure.",
          "Improve the user-facing response or Streamlit interface.",
          "Test the original and new capabilities.",
          "Prepare a short before-and-after explanation.",
        ],
        deliverables: ["Upgraded assistant workflow", "Test evidence", "Before-and-after explanation"],
        checklist: ["Two improvements are visible.", "The original features still work.", "A failure case is handled.", "The final project is ready to demonstrate."],
      },
    ],
  },
];
