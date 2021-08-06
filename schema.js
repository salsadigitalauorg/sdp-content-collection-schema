/**
 * -----------------------------------------------------------------------------
 * Content Collection Schema
 * Version: Draft
 *
 * Tags:
 * @todo       - Need discussion.
 * @drupal     - Possible implementation for the Drupal Content Collection form.
 * @drupal_src - The data source to populate the form field.
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
       * @drupal [Field] Title - search api field name
       * @drupal [Field] Direction - hardcoded options "asc" or "desc"
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
    // Keyword filter
    "keyword": {
      // https://www.elastic.co/guide/en/elasticsearch/reference/7.8/query-dsl-simple-query-string-query.html
      "type": "basic", // "basic" = use phrase match, "custom-xyz" = a custom implementation (e.g. legislation)
      "label": "Search by keyword",
      "placeholder": "Enter keyword(s)",
      "fields": [ "title", "body", "summary_processed" ]
    },
    // Advanced filters
    "filters": {
      "displayHidden": false, // show or hide advanced fields
      "submitOnChange": false,
      "label": "Refine search",
      "submit": {
        "visible": true,
        "label": "Apply change"
      },
      "clearForm": {
        "visible": true, // or "on-dirty"
        "label": "Clear search filters"
      },
      "defaultStyling": true, // Default: 1 field = 100%, 2 fields = 50%, 3 = 33.33% (desktop)
      "fields": [
        {
          "type": "custom-date" // Example custom implementation. Uses a custom hook to populate.
        },
        {
          "type": "basic",
          "component": "rpl-select",
          "options": {
            // Ability to set vue-form-generator field settings directly.
            // If select and no existing values are set, assume aggregation
          },
          "additionalClasses": [ "rpl-col-2" ],
          "elasticsearch-field": "field_year",
          "elasticsearch-aggregation": true, // this will populate the component options
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
