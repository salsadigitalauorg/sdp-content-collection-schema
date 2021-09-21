/**
 * -----------------------------------------------------------------------------
 * Content Collection Schema
 * Version: Draft
 *
 * Tags:
 * @discuss     - Need discussion.
 * @drupal      - Possible implementation for the Drupal Content Collection form.
 * @drupal_src  - The data source to populate the form field.
 * @nuxthook    - This object can be modified in tide.content-collection.js.
 * @deprecated  - Remove from schema
 * @proposal    - Suggestion for change to schema
 * @unavailable - Not yet implemented
 * @implemented - Current implemented
 * -----------------------------------------------------------------------------
 */
const schema = {
  /**
   * Title
   * @drupal [Field] Text input
   * @implemented
   */
  "title": "Search",
  /**
   * Description
   * @drupal [Field] Text area input
   * @implemented
   */
  "description": "",
  /**
   * Call to Action
   * @drupal [Field] Link field with `text` and `url` fields.
   * @implemented
   */
  "callToAction": {
    "text": "View all",
    "url": "/search"
  },
  /**
   * Data Connection Type
   * Default to 'elastic-search', but available here to allow for other endpoints.
   * @drupal Not available
   * @unavailable
   * @proposal We replace this with the "connection" option.
   */
  "dataConnectionType": "elastic-search",
  /**
   * Data Connection Type
   * Default to 'elastic-search', but available here to allow for other endpoints.
   * @unavailable
   * @proposal We include this to handle search endpoint settings
   */
  "connection": {
    "type": "elastic-search",
    "index": "node",
    "serverIndex": "elasticsearch_index_nonprod_node"
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
     * For displaying user defined content - accepts node ids (not UUIDs).
     * @drupal [Field] Multiple entity references
     * @drupal_src Any nodes
     * @implemented
     */
    "contentIds": [],
    /**
     * Content Types
     * For displaying content by type
     * @drupal [Field] Single option select
     * @drupal_src Available content types
     * @implemented
     */
    "contentTypes": ["profile"],
    /**
     * Content Fields
     * For filtering content by various field values
     * @drupal This field only supports 2 hard-coded options: Topics, Tags
     * @implemented
     */
    "contentFields": {
      /**
       * Filter: Topics
       * @drupal Hard-coded option
       * @drupal [Field] "Operator" - "AND" or "OR"
       * @drupal [Field] "Values" - Select multiple topic values
       * @implemented - NOTE: operators not implemented.
       */
      "field_topic": { "operator": "AND", "values": [1] },
      /**
       * Filter: Tags
       * @drupal Hard-coded option
       * @drupal [Field] "Operator" - "AND" or "OR"
       * @drupal [Field] "Values" - Select multiple tag values
       * @implemented - NOTE: operators not implemented.
       */
      "field_tags": { "operator": "AND", "values": [5] }
    },
    /**
     * Include Current Page
     * When used like a "Related articles" list, we may want to exclude current page.
     * @drupal Not available
     * @implemented
     */
    "includeCurrentPage": false,
    /**
     * Exclude Ids
     * Option to exclude ids from results
     * @drupal Not available
     * @unavailable
     */
    "excludeIds": [],
    /**
     * Date filter
     * For filtering content by date
     * @drupal Not available
     * @implemented
     */
    "dateFilter": {
      /**
       * Field: Criteria
       * Options: "today", "this_week", "this_month", "this_year", "today_and_future", "past", "range"
       * @drupal [Field] Select a single option
       * @drupal_src hard coded in option field
       * @implemented
       */
      "criteria": "range",
      /**
       * Field: Start Date
       * Name of field from which to test the date range start
       * @drupal [Field] Select a single option
       * @drupal_src search api fields
       * @implemented
       */
      "startDateField": "field_profile_womens_inducted_date",
      /**
       * Field: End Date
       * Name of field from which to test the date range end
       * @drupal [Field] Select a single option
       * @drupal_src search api fields
       * @implemented
       */
      "endDateField": "field_profile_womens_inducted_date",
      /**
       * Field: Range Start
       * Start of the range test - only shows if critera = "range"
       * @drupal [Field] Date
       * @implemented
       */
      "dateRangeStart": "2021-01-01T11:28:23+10:00",
      /**
       * Field: Range End
       * End of the range test - only shows if critera = "range"
       * @drupal [Field] Date
       * @implemented
       */
      "dateRangeEnd": "2022-01-01T11:28:23+10:00"
    },
    /**
     * Sort
     * If interface.display.sort is available with options, this will be ignored.
     * @drupal [Field] Multiple field collections
     * @implemented
     */
    "sort": [
      /**
       * Field: Sort item
       * @drupal [Field] Sort By - search api field name
       * @drupal [Field] Sort Order - hardcoded options Ascending "asc" or Descending "desc"
       * @implemented
       */
      { "field": "title", "direction": "asc" }
    ],
    /**
     * Items to Load
     * If interface.display.pagination is available with options, this will be ignored.
     * @drupal [Field] Number
     * @implemented
     */
    "itemsToLoad": 10,
    /**
     * -------------------------------------------------------------------------
     * Complex - Pure Elasticsearch DSL Query
     * POST to /search-api - Build functionality in search-api to accept POSTs.
     * @drupal Not available
     * @implemented
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
     * Keep state
     * Store the state of the user interactions in the URL.
     * Allows for bookmarking or sharing individual searches or result pages.
     * Only one Content Collection can use this per page.
     * @implemented
     * @proposal
     */
    "keepState": false,
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
       * @implemented
       */
      "type": "basic",
      /**
       * Label
       * @drupal [Field] Single text
       * @implemented
       */
      "label": "Search by keyword",
      /**
       * Placeholder
       * @drupal [Field] Single text
       * @implemented
       */
      "placeholder": "Enter keyword(s)",
      /**
       * Fields
       * @drupal [Field] Select multiple option
       * @drupal_src search api fields
       * @implemented
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
       * @unavailable
       * @proposal Exposed filters currently use a regular form instead of the
       *           SearchForm. This means the expand button no longer exists.
       *           Can we remove this option?
       */
      "expandSearchFilters": false,
      /**
       * Submit on change
       * If true, changing a filter will automatically update the search results
       * without needing to trigger the submit button.
       * If false, submit button will need to be pressed before search results update.
       * In both cases, the submit button will still be visible and functional.
       * @drupal [Field] Single checkbox
       * @unavailable
       */
      "submitOnChange": false,
      /**
       * Toggle search fields label
       * @drupal [Field] Single text
       * @implemented
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
         * @implemented
         */
        "visibility": "visible",
        /**
         * Label
         * Visible label for the submit button
         * @drupal [Field] Single text
         * @implemented
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
         * @implemented
         */
        "visibility": "visible",
        /**
         * Label
         * Visible label for the clear search button
         * @drupal [Field] Single text
         * @implemented
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
       * @unavailable
       */
      "defaultStyling": true,
      /**
       * Fields
       * The custom fields displayed within advanced search filters.
       * @drupal [Field] Supports only a limited set of hard-coded fields
       * @drupal_src Yet to be determined
       */
      "fields": [
        {
          /**
           * Type
           * Default "basic". If a custom type, then a custom hook will receive
           * this object to provide further processing.
           * @drupal Not available
           * @nuxthook Can accept other types
           * @implemented
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
           * @implemented
           */
          "options": {
            /**
             * VFG: Model
             * This will be used in the URL query string and as a fallback
             * if "elasticsearch-field" is undefined.
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
             */
            "values": [ { id: "topic_a", name: "Topic A" } ]
          },
          /**
           * Additional Classes
           * Classes to add to the form field for styling.
           * @drupal Not available
           * @implemented
           */
          "additionalClasses": [ "rpl-col-2" ],
          /**
           * ES Field
           * The ES Field on which to query elasticsearch against.
           * If not set, it will assume the options.model value is the ES field.
           * @drupal [Field] Select a single option
           * @drupal_src search api fields
           * @implemented
           */
          "elasticsearch-field": "field_year",
          /**
           * ES Aggregation
           * Enable aggregation for a field.
           * If true, the form field values are populated from the result's aggregated values.
           * If false, form field will use static values defined in option.values.
           * @drupal [Field] Checkbox
           * @implemented
           */
          "elasticsearch-aggregation": true,
          /**
           * ES Aggregation Order
           * Set the order ("asc" / "desc") for aggregation results. Defaults to "asc".
           * @drupal Not available
           * @implemented
           * @proposal
           */
          "elasticsearch-aggregation-order": "asc",
          /**
           * ES Aggregation Size
           * Set the number of aggregated results to return. Defaults to 30.
           * @drupal Not available
           * @implemented
           * @proposal
           */
          "elasticsearch-aggregation-size": 30
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
    /**
     * Display of results
     * Options for how the results should display.
     */
    "display": {
      /**
       * Type
       * The type of listing style to use. Default is "grid".
       * @drupal Not available - defaults to "grid"
       * @nuxthook Can accept other types
       * @implemented
       */
      "type": "grid",
      /**
       * Options
       * The configuration options for the type of display.
       */
      "options": {
        /**
         * Result count text
         * Text to display above the results. This is read out to a screen reader when a search is performed.
         * Supports 2 tokens:
         * - {range} - The current range of results E.g. 1-12
         * - {count} - The total count of results
         * @drupal Single text defaults to "Displaying {range} of {count} results"
         * @implemented
         */
        "resultsCountText": "Displaying {range} of {count} results",
        /**
         * Loading text
         * Text to display when search results are loading.
         * @drupal Single text defaults to "Loading"
         * @implemented
         */
        "loadingText": "Loading",
        /**
         * No results text
         * Text to display when no results were returned.
         * @drupal Single text defaults to "Sorry! We couldn't find any matches"
         * @implemented
         */
        "noResultsText": "Sorry! We couldn't find any matches",
        /**
         * Error text
         * Text to display when an error occurs.
         * @drupal Single text defaults to "Search isn't working right now, please try again later."
         * @implemented
         */
        "errorText": "Search isn't working right now, please try again later.",
        /**
         * Sort
         * The configuration options for the exposed user sort.
         * @drupal Not available - defaults to "null"
         * @nuxthook Can be extended
         * @implemented
         */
        "sort": {
          /**
           * Type
           * The type of sort widget to use. Default is "field".
           * @nuxthook Can accept other types (e.g. "table")
           * @implemented
           */
          "type": "field",
          /**
           * Values
           * The exposed field values to display to a user. First value is used by default.
           * @implemented
           */
          "values": [
            { "name": "Relevance", "value": null },
            { "name": "Title A-Z", "value": [ { "field": "title", "direction": "asc" } ] },
            { "name": "Title Z-A", "value": [ { "field": "title", "direction": "desc" } ] },
            { "name": "Newest", "value": [ { "field": "field_date", "direction": "asc" } ] },
            { "name": "Oldest", "value": [ { "field": "field_date", "direction": "desc" } ] }
          ]
        },
        /**
         * Items to load
         * The configuration options for the exposed items to load.
         * @drupal Not available - defaults to "null"
         * @nuxthook Can be extended
         * @implemented
         */
        "itemsToLoad": {
          /**
           * Type
           * The type of items to load widget to use. Default is "field".
           * @nuxthook Can accept other types
           * @implemented
           */
          "type": "field",
          /**
           * Values
           * The exposed field values to display to a user. First value is used by default.
           * @implemented
           */
          "values": [
            { "name": "10", "value": 10 },
            { "name": "20", "value": 20 },
            { "name": "50", "value": 50 },
            { "name": "All", "value": 9999 }
          ]
        },
        /**
         * Pagination
         * The configuration options for the exposed pagination.
         * @nuxthook Can be extended
         * @implemented
         */
        "pagination": {
          /**
           * Type
           * The type of pagination widget to use. Default is "numbers".
           * @drupal Not available - defaults to "numbers"
           * @nuxthook Can accept other types (e.g. "load-more" / "infinite-scroll")
           * @implemented
           */
          "type": "numbers"
        }
      },
      /**
       * Result component
       * The configuration options for displaying the results.
       * @nuxthook Can be extended
       * @implemented
       */
      "resultComponent": {
        /**
         * Type
         * The type of result component to use. Default is "card".
         * Supports options = "card" / "searh-result"
         * @drupal Not available - defaults to "card"
         * @nuxthook Can accept other types
         * @implemented
         */
        "type": "card",
        /**
         * Style
         * The style of the card to display. Only for "card" type.
         * @drupal [Field] Single option - "no-image", "thumbnail", "profile"
         * @implemented
         */
        "style": "thumbnail"
      }
    }
  }
}
