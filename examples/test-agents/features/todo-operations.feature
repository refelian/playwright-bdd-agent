Feature: Todo Operations
  As a user
  I want to manage my todos
  So that I can keep track of tasks

  Background:
    Given I am on the TodoMVC application

  Scenario: Add a New Todo
    When I add a todo "Buy groceries"
    Then I should see the todo "Buy groceries" in the list
    And the todo counter should show "1 item left"
    And the input field should be cleared

  Scenario: Complete a Todo
    Given I have a todo "Buy groceries"
    When I mark the todo "Buy groceries" as complete
    Then the todo "Buy groceries" should be marked as completed
    And the todo counter should show "0 items left"

  Scenario: Delete a Todo
    Given I have a todo "Buy groceries"
    When I delete the todo "Buy groceries"
    Then the todo "Buy groceries" should not be visible
    And the todo counter should show "0 items left"
