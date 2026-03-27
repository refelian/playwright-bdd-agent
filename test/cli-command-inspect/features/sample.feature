Feature: cli-command-inspect

  Scenario: matched scenario
    Given existing step
    Then existing outcome

  Scenario: missing scenario
    Given missing step 10

  Scenario: ambiguous scenario
    When duplicate step
