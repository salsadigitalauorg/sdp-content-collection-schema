/**
 * -----------------------------------------------------------------------------
 * Content Collection Schema
 * Version: Draft
 *
 * Tags:
 * @todo       - Need discussion.
 * @drupal     - Possible implementation for the Drupal Content Collection form.
 * @drupal_src - The data source to populate the form field.
 * @nuxthook   - This object can be modified in tide.content-collection.js.
 * -----------------------------------------------------------------------------
 */
const schema = {
  /**
   * Title
   * @drupal [Field] Text input
   */
  "title": "Search",
  /**
   * Description
   * @drupal [Field] Text area input
   */
  "description": "",
  /**
   * Call to Action
   * @drupal [Field] Link field with `text` and `url` fields.
   */
  "callToAction": {
    "text": "View all",
    "url": "/search"
  },
  /**
   * ---------------------------------------------------------------------------
   * "Internal" contains the rules for generating the search query.
   * These rules are set by default and, with the exception of
   * sort and itemsToLoad, are unable to be changed via an exposed user form.
   * ---------------------------------------------------------------------------
   */
  "internal": {
    /**
     * -------------------------------------------------------------------------
     * Simple - These properties are converted into an Elasticsearch DSL query.
     * -------------------------------------------------------------------------
     */
    /**
     * Content Ids
     * For displaying user defined content
     * @todo Do we use uuid or nids?
     * @drupal [Field] Multiple entity references
     * @drupal_src Any nodes
     */
    "contentIds": [],
    /**
     * Content Types
     * For displaying content by type
     * @drupal [Field] Single option select
     * @drupal_src Available content types
     */
    "contentTypes": ["profile"],
    /**
     * Content Fields
     * For filtering content by various field values
     * @drupal This field only supports 2 hard-coded options: Topics, Tags
     */
    "contentFields": {
      /**
       * Filter: Topics
       * @drupal Hard-coded option
       * @drupal [Field] "Operator" - "AND" or "OR"
       * @drupal [Field] "Values" - Select multiple topic values
       */
      "field_topic": { "operator": "AND", "values": [1] },
      /**
       * Filter: Tags
       * @drupal Hard-coded option
       * @drupal [Field] "Operator" - "AND" or "OR"
       * @drupal [Field] "Values" - Select multiple tag values
       */
      "field_tags": { "operator": "AND", "values": [5] }
    },
    /**
     * Include Current Page
     * When used like a "Related articles" list, we may want to exclude current page.
     * @drupal Not available
     */
    "includeCurrentPage": false,
    /**
     * Exclude Ids
     * Option to exclude ids from results
     * @drupal Not available
     * @todo May need more work
     */
    "excludeIds": [],
    /**
     * Date filter
     * For filtering content by date
     * @drupal Not available
     * @todo May need more work
     */
    "dateFilter": {
      /**
       * Field: Criteria
       * Options: "today", "this_week", "this_month", "this_year", "today_and_future", "past", "range"
       * @drupal [Field] Select a single option
       * @drupal_src hard coded in option field
       */
      "criteria": "range",
      /**
       * Field: Start Date
       * Name of field from which to test the date range start
       * @drupal [Field] Select a single option
       * @drupal_src search api fields
       */
      "startDateField": "field_profile_womens_inducted_date",
      /**
       * Field: End Date
       * Name of field from which to test the date range end
       * @drupal [Field] Select a single option
       * @drupal_src search api fields
       */
      "endDateField": "field_profile_womens_inducted_date",
      /**
       * Field: Range Start
       * Start of the range test - only shows if critera = "range"
       * @drupal [Field] Date
       */
      "dateRangeStart": "2021-01-01T11:28:23+10:00",
      /**
       * Field: Range End
       * End of the range test - only shows if critera = "range"
       * @drupal [Field] Date
       */
      "dateRangeEnd": "2022-01-01T11:28:23+10:00"
    },
    /**
     * Sort
     * If interface.display.sort is available with options, this will be ignored.
     * @drupal [Field] Multiple field collections
     */
    "sort": [
      /**
       * Field: Sort item
       * @drupal [Field] Sort By - search api field name
       * @drupal [Field] Sort Order - hardcoded options Ascending "asc" or Descending "desc"
       */
      { "field": "title", "direction": "asc" }
    ],
    /**
     * Items to Load
     * If interface.display.pagination is available with options, this will be ignored.
     * @drupal [Field] Number
     */
    "itemsToLoad": 10,
    /**
     * -------------------------------------------------------------------------
     * Complex - Pure Elasticsearch DSL Query
     * POST to /search-api - Build functionality in search-api to accept POSTs.
     * @drupal Not available
     * -------------------------------------------------------------------------
     */
    "custom": {
      "bool": {
        "must": {
          "match_all": {}
        },
        "filter": [
          {
            "range": { "field_event_date_end_value": { "gte": "2020-01-30T13:00:00.000Z" } }
          },
          {
            "terms": { "type": ["event"] }
          },
          {
            "terms": { "field_node_site": ["4"] }
          }
        ]
      }
    }
  },
  /**
   * ---------------------------------------------------------------------------
   * "Interface" contains rules for displaying the results, and displaying
   * the exposed user form for changing the search query.
   * Where "type" is used, nuxt-tide will allow for defining custom
   * functions to extend the existing functionality.
   * ---------------------------------------------------------------------------
   */
  "interface": {
    /**
     * Keyword filter
     * User options for filtering by keywords.
     */
    "keyword": {
      /**
       * Type
       * Allows for default "basic" functionality (phrase_match), or custom keyword configurations in FE code.
       * @drupal Not available - defaults to "basic"
       * @nuxthook Can accept other types
       */
      "type": "basic",
      /**
       * Label
       * @drupal [Field] Single text
       * @todo Should we expose to admins?
       */
      "label": "Search by keyword",
      /**
       * Placeholder
       * @drupal [Field] Single text
       * @todo Should we expose to admins?
       */
      "placeholder": "Enter keyword(s)",
      /**
       * Fields
       * @drupal [Field] Select multiple option
       * @drupal_src search api fields
       * @todo Should we expose to admins?
       */
      "fields": [ "title", "body", "summary_processed" ]
    },
    /**
     * Advanced search filters
     * User options for aggregate filtering.
     */
    "filters": {
      /**
       * Expand Search Filters (formally Display Hidden)
       * Show or hide advanced search filter fields.
       * If false, then a toggle button will display to show / hide fields.
       * If true, then no toggle will be visible, and all field show by default.
       * @drupal [Field] Single checkbox
       */
      "expandSearchFilters": false,
      /**
       * Submit on change
       * If true, changing a filter will automatically update the search results
       * without needing to trigger the submit button.
       * If false, submit button will need to be pressed before search results update.
       * In both cases, the submit button will still be visible and functional.
       * @drupal [Field] Single checkbox
       */
      "submitOnChange": false,
      /**
       * Toggle search fields label
       * @drupal [Field] Single text
       * @todo Should we expose to admins?
       */
      "label": "Refine search",
      /**
       * Submit button
       * The button that appears at the end of the advanced search filters.
       */
      "submit": {
        /**
         * Visibility
         * Show or hide the submit button.
         * Options: "visible", "hidden", "when-needed"
         * @drupal [Field] Single option select
         * @drupal_src hard-coded options
         */
        "visibility": "visible",
        /**
         * Label
         * Visible label for the submit button
         * @drupal [Field] Single text
         */
        "label": "Apply change"
      },
      "clearForm": {
        /**
         * Visibility
         * Show or hide the clear form button.
         * Options: "visible", "hidden", "when-needed"
         * @drupal [Field] Single option select
         * @drupal_src hard-coded options
         */
        "visibility": "visible",
        /**
         * Label
         * Visible label for the clear search button
         * @drupal [Field] Single text
         */
        "label": "Clear search filters"
      },
      /**
       * Default styling
       * Automatic column arrangement of advanced search filters.
       * E.g. Desktop 1 field = full width, 2 fields = 50% width, 3 fields = 33%
       * Automatic arrangement can be disabled if a custom form has a special
       * field layout requirement.
       * @drupal Not available
       */
      "defaultStyling": true,
      /**
       * Fields
       * The custom fields displayed within advanced search filters.
       * @drupal Supports only a limited set of hard-coded fields
       * @drupal_src Yet to be determined
       * @todo What types of fields need to be supported?
       */
      "fields": [
        {
          /**
           * Type
           * Default "basic". If a custom type, then a custom hook will receive
           * this object to provide further processing.
           * @drupal Not available
           * @nuxthook Can accept other types
           */
          "type": "basic",
          /**
           * Options
           * Vue Form Generator field options. This object will be passed
           * directly into the form schema to create the form.
           * https://vue-generators.gitbook.io/vue-generators/fields/field_properties
           * JSON schema will not support functions (e.g. validators).
           * For validators, or complex fields, a custom type should be used.
           * @drupal There should be some preset options for filters that will populate this field.
           * @todo How complex should this be for an admin?
           */
          "options": {
            /**
             * VFG: Model
             * This will be used in the URL query string.
             * If not set, it will be set to the value in "elasticsearch-field".
             * @drupal Not available
             */
            "model": "field_year",
            /**
             * VFG: Type
             * Type of form field to use.
             * @drupal Not available - default to "rplselect"
             */
            "type": "rplselect",
            /**
             * VFG: Required
             * Set field to required - this is unlikely to be used for content collection.
             * @drupal Not available - default to "false"
             */
            "required": true,
            /**
             * VFG: Validator
             * Provide a specific validator for the field - this is unlikely to be used for content collection.
             * @drupal Not available - default to "null"
             */
            "validator": ["required"],
            /**
             * VFG: Label
             * The label of the field
             * @drupal Single text field
             */
            "label": "Field label",
            /**
             * VFG: Hint
             * The Hint text below the field
             * @drupal Not available
             */
            "hint": "Field hint text",
            /**
             * VFG: Placholder
             * The placholder text to display on the field
             * @drupal Single text field
             */
            "placeholder": "Field placeholder",
            /**
             * VFG: Values
             * The values of the field. For rplselect, if this is defined,
             * then "elasticsearch-aggregation" should = false, as the values
             * will come from the results.
             * @drupal Multiple values with key (name) value (id)
             * @drupal_src Either a taxonomy or user defined
             * @todo Do we want to allow admins to set static values?
             */
            "values": [ { id: "topic_a", name: "Topic A" } ]
          },
          /**
           * Additional Classes
           * Classes to add to the form field for styling.
           * @drupal Not available
           */
          "additionalClasses": [ "rpl-col-2" ],
          /**
           * ES Field
           * The ES Field on which to test the form values against.
           * @drupal [Field] Select a single option
           * @drupal_src search api fields
           */
          "elasticsearch-field": "field_year",
          /**
           * ES Aggregation
           * Enable aggregation for a field.
           * If true, form field values will change to the es field's aggregated results.
           * If false, form field will not change it's values.
           * @drupal [Field] Checkbox
           */
          "elasticsearch-aggregation": true, // this will populate the component options
        },
        /**
         * Example of a custom type that will use a hook to populate.
         * @drupal Not available
         * @nuxthook
         */
        {
          "type": "custom-date"
        }
      ]
    },
    // Display of results
    "display": {
      "type": "grid", // extensible -> allow for more
      "options": {
        // Options passed to the display component
        "resultsCountText": "Displaying {range} of {count} results",
        "loadingText": "Loading",
        "noResultsText": "Sorry! We couldn't find any matches",
        "errorText": "Search isn't working right now, please try again later.",
        "sort": {
          "userExposedOptions": [
            { "name": "Relevance", "value": null },
            { "name": "Title A-Z", "value": [ { "field": "title", "direction": "asc" } ] },
            { "name": "Title Z-A", "value": [ { "field": "title", "direction": "desc" } ] },
            { "name": "Newest", "value": [ { "field": "field_date", "direction": "asc" } ] },
            { "name": "Oldest", "value": [ { "field": "field_date", "direction": "desc" } ] }
          ]
        },
        "pagination": {
          "type": "list", // Future examples: "load-more" / "infinite-scroll"
          "userExposedOptions": [
            { "name": "10", "value": 10 },
            { "name": "20", "value": 20 },
            { "name": "50", "value": 50 },
            { "name": "All", "value": 9999 }
          ]
        }
      },
      "resultComponent": {
        // Object passed to a custom "hook" to implement mapping.
        "type": "basic-card"
      }
    }
  }
}
