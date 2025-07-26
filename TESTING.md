# Linian Plugin Testing & Debugging Guide

## 🔍 **DEBUGGING STEPS**

### Step 1: Check Plugin Loading
1. Open Obsidian Developer Tools (Ctrl+Shift+I)
2. Go to Console tab
3. Reload/restart Obsidian
4. Look for these messages:
```
Loading Linian plugin...
Loaded settings: [Object with your settings]
API key found, initializing services  // (or "No API key found")
Registering markdown post processor
Linian plugin loaded successfully
```

### Step 2: Use Debug Command
1. Open Command Palette (Ctrl+P)
2. Type "Debug Linear Shortcodes"
3. Run the command
4. Check console for:
```
=== DEBUGGING LINEAR SHORTCODES ===
Full page content: [Your note content]
Found matches in content: [Array of matches or null]
Elements containing shortcodes: [Array of elements]
```

### Step 3: Test Regex Pattern
In the console, run:
```javascript
// Test the regex pattern
const regex = /\[([A-Za-z]+(?:-[A-Za-z]*)?-\d+)\]/gi;
console.log("Test TEAM-486:", regex.test("[TEAM-486]"));
regex.lastIndex = 0; // Reset for next test
console.log("Test team-655:", regex.test("[team-655]"));
```

### Step 4: Test Live Preview Mode
1. Create a new note
2. Make sure you're in **Live Preview** mode (not Reading mode)
3. Type: `[TEAM-486]` and press **Space** or **Tab**
4. The shortcode should **immediately convert** to a visual issue link
5. Watch console for any errors

### Step 5: Test Reading Mode  
1. Switch to **Reading** mode
2. The shortcode should also be converted to issue links
3. Watch console for post processor activity

### Step 6: Check Issue Fetching
If matches are found, you should see:
```
Fetching Linear issue: TEAM-486
Getting issue: TEAM-486
Making GraphQL request to Linear API
Fetched issue: [Issue Object]
Rendered issue: TEAM-486
```

If there are errors, you might see:
```
Error fetching Linear issue: [Error details]
```

## 🚨 **COMMON ISSUES & FIXES**

### Issue 1: Post Processor Not Triggering
**Symptoms**: No console output when typing shortcodes
**Solutions**:
- Restart Obsidian completely
- Disable and re-enable the plugin
- Check if you're in Reading/Preview mode (try Live Preview or Edit mode)

### Issue 2: Services Not Initialized
**Symptoms**: "Services not initialized, skipping processing"
**Solutions**:
- Check that API key is saved in settings
- Try reloading the plugin
- Check console for settings loading errors

### Issue 3: Regex Not Matching
**Symptoms**: "No matches found in HTML content"
**Solutions**:
- Verify your issue format matches: `[TEAM-123]` or `[team-123]`
- Test in console with the regex test above
- Check for special characters or spaces

### Issue 4: API Errors
**Symptoms**: GraphQL errors or HTTP errors
**Solutions**:
- Verify API key is correct (starts with `lin_api_`)
- Test connection in plugin settings
- Check network connectivity

## 🧪 **MANUAL TESTING**

### Test Different Formats
Try these in your notes:
- `[TEAM-486]` (uppercase)
- `[team-486]` (lowercase) 
- `[DEV-123]` (short team name)
- `[ENGINEERING-TEAM-456]` (long team name)

### Check Plugin State
In console:
```javascript
// Check plugin
const plugin = app.plugins.plugins.linian;
console.log("Plugin loaded:", !!plugin);
console.log("Settings:", plugin?.settings);
console.log("API Service:", !!plugin?.apiService);
console.log("Renderer:", !!plugin?.renderer);
```

### Force Processing
```javascript
// Manually trigger processing on current element
const plugin = app.plugins.plugins.linian;
const activeLeaf = app.workspace.activeLeaf;
if (activeLeaf && plugin) {
  const element = activeLeaf.view.contentEl;
  plugin.processLinearShortcodes(element, {});
}
```

## ✅ **SUCCESS INDICATORS**

You should see this progression:
1. ✅ Plugin loads without errors
2. ✅ Settings are loaded correctly  
3. ✅ API service initializes (if API key present)
4. ✅ Post processor triggers when typing shortcodes
5. ✅ Regex matches your shortcode format
6. ✅ Loading element appears in HTML
7. ✅ API request is made to Linear
8. ✅ Issue data is fetched or error is handled
9. ✅ Final element replaces loading element

## 🔧 **LATEST UPDATE - FULLY FIXED LINEAR API INTEGRATION**

**🎉 CRITICAL FIX: Now Uses Correct Linear GraphQL API Structure**
- ✅ **FIXED: Authentication format** - Uses `Authorization: <API_KEY>` (no Bearer, verified working)
- ✅ **FIXED: GraphQL query structure** - Now uses correct `issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $number } })` format
- ✅ **FIXED: Issue parsing** - Correctly parses `TEAM-474` into team "TEAM" and number 474
- ✅ **FIXED: Response structure** - Handles `issues.nodes[]` array response instead of single `issue` object
- ✅ **FIXED: Field mapping** - Uses `name` instead of `displayName` for assignees (as per Linear API)
- ✅ **TESTED: Real API verification** - Confirmed working with actual Linear workspace data

**Example Issues for Testing:**
- ✅ `TEAM-474` - "Example issue title" (Priority: 2, Status: Done)
- ✅ `TEAM-473` - "Another example issue" (Priority: 1, Status: Done)
- ✅ `TEAM-472` - "Work in progress issue" (Priority: 0, Status: In Progress)
- ✅ `TEAM-471` - "High priority task" (Priority: 3, Status: Done)
- ✅ `TEAM-470` - "Medium priority item" (Priority: 2, Status: In Progress)

**Fixed in this version**:
- ✅ Case-insensitive regex (now matches both `[TEAM-486]` and `[team-486]`)
- ✅ Better service initialization 
- ✅ Enhanced debugging output
- ✅ Improved error handling
- ✅ Regex reset handling for global matches
- ✅ **NEW: Jira-style HTML processing with container elements**
- ✅ **NEW: Uses `replaceChildren()` for DOM updates**
- ✅ **NEW: Proper inline issue container CSS classes**
- ✅ **🎉 MAJOR: Added Live Preview support with Editor Extensions!**
- ✅ **🎉 MAJOR: Dual-mode rendering like Jira plugin (Reading Mode + Live Preview)**
- ✅ **🎉 MAJOR: Real-time shortcode conversion as you type!**
- ✅ **🎉 CRITICAL: Linear API integration now uses verified working GraphQL queries!**
- ✅ **🎉 VERIFIED: Tested with real Linear workspace data and confirmed full functionality!**

---

**Now test again and report what you see in the console!**
