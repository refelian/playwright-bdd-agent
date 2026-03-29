Feature: Playwright Documentation

  Background:
    Given I am on the Playwright docs site

  Scenario: Check main heading
    Then I see the page title "Playwright"

  Scenario: Navigate to installation guide
    When I click the "Get started" link
    Then I see the heading "Installation"
    And the URL contains "/docs/intro"

  Scenario: Search for locators documentation
    When I open the search dialog
    And I search for "locators"
    Then I see search results containing "Locators"

  Scenario: Verify API reference navigation
    When I click the "API" link in the navigation
    Then I see the heading "Playwright Library"
    # intentionally fails
    And I see a list with more than 50 items
