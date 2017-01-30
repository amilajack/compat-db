/**
 * A collection of tests not related to determining compatability. These tests
 * are used to determine the types of API's.
 *
 * These tests only run on the latest version of popular browsers.
 *
 * It determines ASTNodeTypes and find all the CSS properties and values.
 * ASTNodeTypes are determined by running the test generated from
 * `determineASTNodeType()`.
 *
 * CSS properties are categorized as either properties or values. Find all the
 * CSS properties and values in latest browser. For each css-api record,
 * if exists in found properties, then it is a property, and vice versa.
 *
 * @flow
 */
