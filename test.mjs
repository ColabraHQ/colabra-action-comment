// test.ts
// import { runAction } from "./src/index";
import { runAction } from "./src/index.ts";

// Set up the inputs as environment variables.
// GitHub Actions passes inputs as environment variables prefixed with "INPUT_"
// with the input name in uppercase.
process.env["INPUT_API_KEY"] = "sk_x9bmvfu7ounaofi6v40aa1d5jsbgoc3jz4w2vgcvevrt5vlo";
process.env["INPUT_WORKSPACE_SLUG"] = "rubbie-kelvin";
process.env["INPUT_RESOURCE_ID"] = "PRO-9"; // or PRO-123
process.env["INPUT_BODY_TEXT"] = "This is a test comment";

// Optionally enable debug logging:
process.env["ACTIONS_STEP_DEBUG"] = "true";

// Execute your action:
runAction();
