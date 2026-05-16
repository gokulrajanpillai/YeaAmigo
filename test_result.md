#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Update YeaAmigo app: fix Sign Out, hide scrollbars, polish mascot/tagline, map-based address selection (OpenStreetMap), expand i18n coverage to dish names/descriptions across 7 languages."

frontend:
  - task: "Fix Sign Out & global AuthGuard"
    implemented: true
    working: true
    file: "app/_layout.tsx, src/auth.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Added global AuthGuard in root layout that watches segments + auth state and replaces to /(auth)/login when user becomes null inside protected groups. logout() now also clears cart + uses setToken(null) first for atomic gate."
  - task: "Hide scrollbars globally"
    implemented: true
    working: true
    file: "all app/**/*.tsx + app/_layout.tsx web CSS"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Added showsVerticalScrollIndicator={false} and showsHorizontalScrollIndicator={false} to every ScrollView and FlatList via script. Also injected global CSS (::-webkit-scrollbar display:none) on web preview."
  - task: "Map-based Address Selection (OpenStreetMap + Leaflet, no API key)"
    implemented: true
    working: true
    file: "app/(customer)/address.tsx, src/address.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "New AddressContext stores saved addresses + active selection in AsyncStorage. New address picker screen with list, OSM Leaflet map (WebView/iframe), draggable pin via center crosshair, Nominatim forward+reverse geocode, current-location via geolocation API, Home/Work/Other labels, manual form fallback. Wired to home header + cart."
  - task: "i18n dynamic content translation (dish names, descriptions, cuisine tags)"
    implemented: true
    working: true
    file: "src/i18n.tsx, all customer screens"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Added tn() lookup of dish names, descriptions, cuisine tags, categories, dietary tags across 7 languages (en/hi/ta/ml/kn/mr/bn). Wired tn() throughout home/cart/restaurant/orders/order-tracking. Verified visually: switched to Hindi and dish names/descriptions render in Devanagari."
  - task: "Mascot & tagline polish"
    implemented: true
    working: true
    file: "src/components/Mascot.tsx (existing - rich), used in empty/loading/success states"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Penguin mascot used across login, profile, empty cart (hungry), empty orders (waiting), support (sorry), order tracking (celebrate on delivered), home, address picker (searching). Tagline 'Food delivery made easy' applied via t('tagline') with translations."
  - task: "Tab bar label visibility"
    implemented: true
    working: true
    file: "app/(*)/_layout.tsx"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Bumped tab bar height to 64+bottomPad, label margin, tabBarShowLabel: true, fontSize 11 to fit comfortably."

backend:
  - task: "No backend changes this iteration"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "MongoDB + FastAPI kept as-is. INR pricing, seeded data, JWT auth all confirmed working via UI smoke (login -> home -> restaurant -> address picker)."

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Map-based Address Selection (OpenStreetMap + Leaflet, no API key)"
    - "Fix Sign Out & global AuthGuard"
    - "i18n dynamic content translation"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
      message: "Completed: Sign Out fix (global AuthGuard), hidden scrollbars globally (per-component + web CSS), map-based address picker (OSM Leaflet via WebView/iframe — no API key, Nominatim search & reverse-geocode, draggable pin), i18n expansion (7 languages cover static UI + dynamic dish names/descriptions/categories/cuisine tags/dietary tags), penguin mascot polish (used across empty/loading/success). Verified: login, home (Bengaluru, MG Road address header), restaurant detail (Hindi translated), address picker (OSM map renders with pin, reverse-geocode auto-fills). Backend untouched — no retest needed."
