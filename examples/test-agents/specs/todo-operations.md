# Test Plan: Todo Operations

## Scenario: Add a New Todo

**Pre-conditions:**
- User is on the TodoMVC application page
- No todos exist initially

**Steps:**
1. Navigate to https://demo.playwright.dev/todomvc
2. Enter "Buy groceries" in the todo input field
3. Press Enter to add the todo

**Expected Results:**
- Todo "Buy groceries" appears in the todo list
- Todo counter shows "1 item left"
- Input field is cleared

**Test Data:**
- Todo text: "Buy groceries"

## Scenario: Complete a Todo

**Pre-conditions:**
- User is on the TodoMVC application page
- At least one uncompleted todo exists

**Steps:**
1. Click the checkbox next to the todo item
2. Observe the todo item appearance

**Expected Results:**
- Todo item is marked with a line-through
- Todo counter decreases by 1
- Checkbox is checked

## Scenario: Delete a Todo

**Pre-conditions:**
- User is on the TodoMVC application page
- At least one todo exists

**Steps:**
1. Hover over the todo item
2. Click the delete button (×) that appears

**Expected Results:**
- Todo item is removed from the list
- Todo counter updates accordingly
- If no todos remain, counter shows "0 items left"
