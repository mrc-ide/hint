/**
  * This file was automatically generated.
  * DO NOT MODIFY IT BY HAND.
  * Instead, modify the hintr JSON schema files
  * and run ./generate-types.sh to regenerate this file.
*/
export interface AdrMetadataResponse {
  type: "spectrum" | "coarse_output" | "summary" | "comparison";
  description: string | null;
}
export interface AncDataRow {
  area_id: string;
  age_group: string;
  year: number;
  anc_clients: number;
  anc_hiv_status?: number;
  anc_known_pos: number;
  anc_already_art: number;
  anc_tested: number;
  anc_tested_pos: number;
  anc_prevalence: number;
  anc_art_coverage: number;
  [k: string]: any;
}
export interface AncFilters {
  year: {
    label: string;
    id: string;
    description?: string;
  }[];
  indicators: {
    label: string;
    id: string;
    description?: string;
  }[];
}
export type AncResponseData = {
  area_id: string;
  age_group: string;
  year: number;
  anc_clients: number;
  anc_hiv_status?: number;
  anc_known_pos: number;
  anc_already_art: number;
  anc_tested: number;
  anc_tested_pos: number;
  anc_prevalence: number;
  anc_art_coverage: number;
  [k: string]: any;
}[];
export interface BarchartDefaults {
  indicator_id: string;
  x_axis_id: string;
  disaggregate_by_id: string;
  selected_filter_options: {
    [k: string]: any;
  };
}
export interface BarchartIndicator {
  indicator: string;
  value_column: string;
  indicator_column: string;
  indicator_value: string;
  indicator_sort_order?: number;
  name: string;
  error_low_column: string;
  error_high_column: string;
  scale: number;
  accuracy: number | null;
  format: string;
}
export interface BarchartMetadata {
  indicators: {
    indicator: string;
    value_column: string;
    indicator_column: string;
    indicator_value: string;
    indicator_sort_order?: number;
    name: string;
    error_low_column: string;
    error_high_column: string;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  filters: {
    id: string;
    column_id: string;
    label: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean | null;
  }[];
  defaults?: {
    indicator_id: string;
    x_axis_id: string;
    disaggregate_by_id: string;
    selected_filter_options: {
      [k: string]: any;
    };
  };
}
export interface CalibrateDataResponse {
  data: {
    area_id: string;
    sex: string;
    age_group: string;
    calendar_quarter: string;
    indicator: string;
    mode: number | null;
    mean: number | null;
    lower: number | null;
    upper: number | null;
    [k: string]: any;
  }[];
  [k: string]: any;
}
export interface CalibrateMetadataResponse {
  filterTypes: {
    id: string;
    column_id: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean;
  }[];
  indicators: {
    indicator: string;
    value_column: string;
    error_low_column?: string;
    error_high_column?: string;
    indicator_column?: string;
    indicator_value?: string;
    indicator_sort_order?: number;
    name: string;
    min: number;
    max: number;
    colour: string;
    invert_scale: boolean;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  plotSettingsControl: {
    choropleth: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
    barchart: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
    table: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
    bubble: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
  };
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
  [k: string]: any;
}
export type CalibratePlotData = {
  data_type: "spectrum" | "calibrated" | "raw" | "calibration_ratio";
  spectrum_region_code: string;
  spectrum_region_name: string;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  mean: number | null;
  [k: string]: any;
}[];
export interface CalibratePlotMetadata {
  filterTypes: {
    id: string;
    column_id: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean;
  }[];
  indicators: {
    indicator: string;
    value_column: string;
    error_low_column?: string;
    error_high_column?: string;
    indicator_column?: string;
    indicator_value?: string;
    indicator_sort_order?: number;
    name: string;
    min: number;
    max: number;
    colour: string;
    invert_scale: boolean;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  plotSettingsControl: {
    calibrate: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
  };
  [k: string]: any;
}
export interface CalibratePlotResponse {
  data: {
    data_type: "spectrum" | "calibrated" | "raw" | "calibration_ratio";
    spectrum_region_code: string;
    spectrum_region_name: string;
    sex: string;
    age_group: string;
    calendar_quarter: string;
    indicator: string;
    mean: number | null;
    [k: string]: any;
  }[];
  metadata: {
    filterTypes: {
      id: string;
      column_id: string;
      options: {
        label: string;
        id: string;
        description?: string;
      }[];
      use_shape_regions?: boolean;
    }[];
    indicators: {
      indicator: string;
      value_column: string;
      error_low_column?: string;
      error_high_column?: string;
      indicator_column?: string;
      indicator_value?: string;
      indicator_sort_order?: number;
      name: string;
      min: number;
      max: number;
      colour: string;
      invert_scale: boolean;
      scale: number;
      accuracy: number | null;
      format: string;
    }[];
    plotSettingsControl: {
      calibrate: {
        defaultEffect?: {
          setFilters?: {
            filterId: string;
            label: string;
            stateFilterId: string;
          }[];
          setMultiple?: string[];
          setFilterValues?: {
            [k: string]: string[];
          };
          setHidden?: string[];
          customPlotEffect?: {
            row: string[];
            column: string[];
          };
        };
        plotSettings: {
          id: string;
          label: string;
          options: {
            id: string;
            label: string;
            effect: {
              setFilters?: {
                filterId: string;
                label: string;
                stateFilterId: string;
              }[];
              setMultiple?: string[];
              setFilterValues?: {
                [k: string]: string[];
              };
              setHidden?: string[];
              customPlotEffect?: {
                row: string[];
                column: string[];
              };
            };
          }[];
          value?: string;
          hidden?: boolean;
        }[];
      };
    };
    [k: string]: any;
  };
}
export interface CalibratePlotRow {
  data_type: "spectrum" | "calibrated" | "raw" | "calibration_ratio";
  spectrum_region_code: string;
  spectrum_region_name: string;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  mean: number | null;
  [k: string]: any;
}
export interface CalibrateResultPathResponse {
  path: string;
  [k: string]: any;
}
export interface CalibrateResultResponse {
  data: {
    area_id: string;
    sex: string;
    age_group: string;
    calendar_quarter: string;
    indicator: string;
    mode: number | null;
    mean: number | null;
    lower: number | null;
    upper: number | null;
    [k: string]: any;
  }[];
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
  [k: string]: any;
}
export interface CalibrateStatusResponse {
  id: string;
  done: boolean | null;
  status: string;
  success: boolean | null;
  queue: number;
  progress: (
    | {
        started: boolean;
        complete: boolean;
        value?: number;
        name: string;
        helpText?: string;
      }
    | string
  )[];
}
export interface CalibrateSubmitRequest {
  options: {
    [k: string]: any;
  };
  version: {
    hintr: string;
    naomi: string;
    rrq: string;
    [k: string]: any;
  };
}
export interface CalibrateSubmitResponse {
  id: string;
}
export interface ChoroplethIndicatorMetadata {
  indicator: string;
  value_column: string;
  error_low_column?: string;
  error_high_column?: string;
  indicator_column?: string;
  indicator_value?: string;
  indicator_sort_order?: number;
  name: string;
  min: number;
  max: number;
  colour: string;
  invert_scale: boolean;
  scale: number;
  accuracy: number | null;
  format: string;
}
export interface ChoroplethMetadata {
  indicators: {
    indicator: string;
    value_column: string;
    error_low_column?: string;
    error_high_column?: string;
    indicator_column?: string;
    indicator_value?: string;
    indicator_sort_order?: number;
    name: string;
    min: number;
    max: number;
    colour: string;
    invert_scale: boolean;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  filters: {
    id: string;
    column_id: string;
    label: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean | null;
  }[];
}
export interface Column {
  id: string;
  column_id: string;
  label: string;
  values:
    | {
        label: string;
        id: string;
        children?: {
          [k: string]: any;
        }[];
      }
    | {
        label: string;
        id: string;
        description?: string;
        format?: string;
        accuracy?: number | null;
      }[];
}
export type ColumnValues = {
  label: string;
  id: string;
  description?: string;
  format?: string;
  accuracy?: number | null;
}[];
export interface ComparisonBarchartMetadata {
  indicators: {
    indicator: string;
    value_column: string;
    indicator_column: string;
    indicator_value: string;
    indicator_sort_order?: number;
    name: string;
    error_low_column: string;
    error_high_column: string;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  filters: {
    id: string;
    column_id: string;
    label: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean | null;
  }[];
  defaults: {
    indicator_id: string;
    x_axis_id: string;
    disaggregate_by_id: string;
    selected_filter_options: {
      [k: string]: any;
    };
  };
  selections: {
    indicator_id: string;
    x_axis_id: string;
    disaggregate_by_id: string;
    selected_filter_options: {
      [k: string]: any;
    };
  }[];
}
export type ComparisonPlotData = {
  area_id: string;
  area_name: string;
  area_level?: number;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  source: string;
  mean: number | null;
  lower: number | null;
  upper: number | null;
  [k: string]: any;
}[];
export interface ComparisonPlotMetadata {
  filterTypes: {
    id: string;
    column_id: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean;
  }[];
  indicators: {
    indicator: string;
    value_column: string;
    error_low_column?: string;
    error_high_column?: string;
    indicator_column?: string;
    indicator_value?: string;
    indicator_sort_order?: number;
    name: string;
    min: number;
    max: number;
    colour: string;
    invert_scale: boolean;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  plotSettingsControl: {
    comparison: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
  };
  [k: string]: any;
}
export interface ComparisonPlotResponse {
  data: {
    area_id: string;
    area_name: string;
    area_level?: number;
    sex: string;
    age_group: string;
    calendar_quarter: string;
    indicator: string;
    source: string;
    mean: number | null;
    lower: number | null;
    upper: number | null;
    [k: string]: any;
  }[];
  metadata: {
    filterTypes: {
      id: string;
      column_id: string;
      options: {
        label: string;
        id: string;
        description?: string;
      }[];
      use_shape_regions?: boolean;
    }[];
    indicators: {
      indicator: string;
      value_column: string;
      error_low_column?: string;
      error_high_column?: string;
      indicator_column?: string;
      indicator_value?: string;
      indicator_sort_order?: number;
      name: string;
      min: number;
      max: number;
      colour: string;
      invert_scale: boolean;
      scale: number;
      accuracy: number | null;
      format: string;
    }[];
    plotSettingsControl: {
      comparison: {
        defaultEffect?: {
          setFilters?: {
            filterId: string;
            label: string;
            stateFilterId: string;
          }[];
          setMultiple?: string[];
          setFilterValues?: {
            [k: string]: string[];
          };
          setHidden?: string[];
          customPlotEffect?: {
            row: string[];
            column: string[];
          };
        };
        plotSettings: {
          id: string;
          label: string;
          options: {
            id: string;
            label: string;
            effect: {
              setFilters?: {
                filterId: string;
                label: string;
                stateFilterId: string;
              }[];
              setMultiple?: string[];
              setFilterValues?: {
                [k: string]: string[];
              };
              setHidden?: string[];
              customPlotEffect?: {
                row: string[];
                column: string[];
              };
            };
          }[];
          value?: string;
          hidden?: boolean;
        }[];
      };
    };
    [k: string]: any;
  };
}
export interface ComparisonPlotRow {
  area_id: string;
  area_name: string;
  area_level?: number;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  source: string;
  mean: number | null;
  lower: number | null;
  upper: number | null;
  [k: string]: any;
}
export type CustomPlotMetadata = TableMetadata;

export interface TableMetadata {
  row: string[];
  column: string[];
}
export interface DownloadStatusResponse {
  id: string;
  done: boolean | null;
  status: string;
  success: boolean | null;
  queue: number;
  progress: (
    | {
        started: boolean;
        complete: boolean;
        value?: number;
        name: string;
        helpText?: string;
      }
    | string
  )[];
}
export interface DownloadSubmitRequest {
  notes?: {
    project_notes?: {
      name?: string;
      updated?: string;
      note: string;
    };
    version_notes?: {
      name?: string;
      updated?: string;
      note: string;
    }[];
  };
  state?: {
    datasets: {
      pjnz: {
        path: string | null;
        filename: string;
      };
      population: {
        path: string | null;
        filename: string;
      };
      shape: {
        path: string | null;
        filename: string;
      };
      survey: {
        path: string | null;
        filename: string;
      };
      programme?: {
        path: string | null;
        filename: string;
      };
      anc?: {
        path: string | null;
        filename: string;
      };
    };
    model_fit: {
      options: {
        [k: string]: any;
      };
      id: string;
    };
    calibrate: {
      options: {
        [k: string]: any;
      };
      id: string;
    };
    version: {
      hintr: string;
      naomi: string;
      rrq: string;
      [k: string]: any;
    };
  };
  pjnz?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  vmmc?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
}
export interface DownloadSubmitResponse {
  id: string;
}
export type ErrorCode = string;
export interface Error {
  error: string;
  detail: string | null;
  key?: string;
  job_id?: string;
  [k: string]: any;
}
export interface File {
  path: string | null;
  filename: string;
}
export type FileName = string;
export type FilePath = string | null;
export interface Filter {
  id: string;
  column_id: string;
  label: string;
  options: {
    label: string;
    id: string;
    description?: string;
  }[];
  use_shape_regions?: boolean | null;
}
export interface FilterOption {
  label: string;
  id: string;
  description?: string;
}
export interface FilterRef {
  filterId: string;
  label: string;
  stateFilterId: string;
}
export interface FilterTypes {
  id: string;
  column_id: string;
  options: {
    label: string;
    id: string;
    description?: string;
  }[];
  use_shape_regions?: boolean;
}
export interface HintrVersionResponse {
  [k: string]: string;
}
export interface HintrWorkerStatus {
  [k: string]: "BUSY" | "IDLE" | "PAUSED" | "EXITED" | "LOST";
}
export interface InputDatasets {
  pjnz: {
    path: string | null;
    filename: string;
  };
  population: {
    path: string | null;
    filename: string;
  };
  shape: {
    path: string | null;
    filename: string;
  };
  survey: {
    path: string | null;
    filename: string;
  };
  programme?: {
    path: string | null;
    filename: string;
  };
  anc?: {
    path: string | null;
    filename: string;
  };
}
export type InputTimeSeriesData = {
  area_id: string;
  area_name: string;
  plot: string | null;
  value: number | null;
  area_level?: number;
  age_group?: string;
  time_period: string;
  quarter: string;
  area_hierarchy: string;
  missing_ids?: string[] | null;
}[];
export interface InputTimeSeriesDefaults {
  selected_filter_options: {
    [k: string]: any;
  };
}
export interface InputTimeSeriesMetadata {
  columns: {
    id: string;
    column_id: string;
    label: string;
    values:
      | {
          label: string;
          id: string;
          children?: {
            [k: string]: any;
          }[];
        }
      | {
          label: string;
          id: string;
          description?: string;
          format?: string;
          accuracy?: number | null;
        }[];
  }[];
  defaults: {
    selected_filter_options: {
      [k: string]: any;
    };
  };
}
export interface InputTimeSeriesRequest {
  data: {
    [k: string]: any;
  };
}
export interface InputTimeSeriesResponse {
  data: {
    area_id: string;
    area_name: string;
    plot: string | null;
    value: number | null;
    area_level?: number;
    age_group?: string;
    time_period: string;
    quarter: string;
    area_hierarchy: string;
    missing_ids?: string[] | null;
  }[];
  metadata: {
    columns: {
      id: string;
      column_id: string;
      label: string;
      values:
        | {
            label: string;
            id: string;
            children?: {
              [k: string]: any;
            }[];
          }
        | {
            label: string;
            id: string;
            description?: string;
            format?: string;
            accuracy?: number | null;
          }[];
    }[];
    defaults: {
      selected_filter_options: {
        [k: string]: any;
      };
    };
  };
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface InputTimeSeriesRow {
  area_id: string;
  area_name: string;
  plot: string | null;
  value: number | null;
  area_level?: number;
  age_group?: string;
  time_period: string;
  quarter: string;
  area_hierarchy: string;
  missing_ids?: string[] | null;
}
export type InputType = "pjnz" | "shape" | "population" | "survey" | "programme" | "anc" | "vmmc";
export interface LevelLabels {
  id: number;
  area_level_label: string;
  display: boolean;
}
export interface ModelCalibrateRequest {
  options: {
    [k: string]: any;
  };
  version: {
    hintr: string;
    naomi: string;
    rrq: string;
    [k: string]: any;
  };
}
export type ModelCancelResponse = null;
export interface ModelOptionsValidate {
  valid: true;
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface ModelOptionsValidateRequest {
  data: {
    pjnz: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    shape: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    population: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    survey: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    programme?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    anc?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
  };
  options: {
    [k: string]: any;
  };
}
export type ModelResultData = {
  area_id: string;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  mode: number | null;
  mean: number | null;
  lower: number | null;
  upper: number | null;
  [k: string]: any;
}[];
export interface ModelResultResponse {
  id: string;
  complete: true;
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
  [k: string]: any;
}
export interface ModelResultRow {
  area_id: string;
  sex: string;
  age_group: string;
  calendar_quarter: string;
  indicator: string;
  mode: number | null;
  mean: number | null;
  lower: number | null;
  upper: number | null;
  [k: string]: any;
}
export interface ModelRunOptions {
  controlSections: ControlSection[];
}
export interface ControlSection {
  label: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  controlGroups: ControlGroup[];
}
export interface ControlGroup {
  label?: string;
  controls: (SelectControl | MultiselectControl | NumberControl)[];
}
export interface SelectControl {
  name: string;
  label?: string;
  type: "select";
  required: boolean;
  value?: string;
  helpText?: string;
  options: {
    id: string;
    label: string;
    children?: {
      [k: string]: any;
    }[];
  }[];
}
export interface MultiselectControl {
  name: string;
  label?: string;
  type: "multiselect";
  required: boolean;
  value?: string[] | string;
  helpText?: string;
  options: {
    id: string;
    label: string;
    children?: {
      [k: string]: any;
    }[];
  }[];
}
export interface NumberControl {
  name: string;
  label?: string;
  type: "number";
  required: boolean;
  value?: number;
  helpText?: string;
  min?: number;
  max?: number;
}
export interface ModelRunOptionsRequest {
  shape: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  survey: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  programme?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  anc?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
}
export interface ModelStatusResponse {
  id: string;
  done: boolean | null;
  status: string;
  success: boolean | null;
  queue: number;
  progress: {
    started: boolean;
    complete: boolean;
    value?: number;
    name: string;
    helpText?: string;
  }[];
}
export interface ModelSubmitData {
  pjnz: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  shape: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  population: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  survey: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  programme?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  anc?: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
}
export interface ModelSubmitRequest {
  data: {
    pjnz: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    shape: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    population: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    survey: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    programme?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    anc?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
  };
  options: {
    [k: string]: any;
  };
  version: {
    hintr: string;
    naomi: string;
    rrq: string;
    [k: string]: any;
  };
}
export interface ModelSubmitResponse {
  id: string;
}
export interface NestedColumnValue {
  label: string;
  id: string;
  children?: {
    [k: string]: any;
  }[];
}
export interface NestedFilterOption {
  label: string;
  id: string;
  children?: {
    [k: string]: any;
  }[];
}
export interface Notes {
  project_notes?: Note;
  version_notes?: Note[];
}
export interface Note {
  name?: string;
  updated?: string;
  note: string;
}
export interface PjnzResponseData {
  country: string;
  iso3: string;
}
export interface PlotSetting {
  id: string;
  label: string;
  options: {
    id: string;
    label: string;
    effect: {
      setFilters?: {
        filterId: string;
        label: string;
        stateFilterId: string;
      }[];
      setMultiple?: string[];
      setFilterValues?: {
        [k: string]: string[];
      };
      setHidden?: string[];
      customPlotEffect?: {
        row: string[];
        column: string[];
      };
    };
  }[];
  value?: string;
  hidden?: boolean;
}
export interface PlotSettingEffect {
  setFilters?: {
    filterId: string;
    label: string;
    stateFilterId: string;
  }[];
  setMultiple?: string[];
  setFilterValues?: {
    [k: string]: string[];
  };
  setHidden?: string[];
  customPlotEffect?: {
    row: string[];
    column: string[];
  };
}
export interface PlotSettingOption {
  id: string;
  label: string;
  effect: {
    setFilters?: {
      filterId: string;
      label: string;
      stateFilterId: string;
    }[];
    setMultiple?: string[];
    setFilterValues?: {
      [k: string]: string[];
    };
    setHidden?: string[];
    customPlotEffect?: {
      row: string[];
      column: string[];
    };
  };
}
export interface PlotSettingsControl {
  defaultEffect?: {
    setFilters?: {
      filterId: string;
      label: string;
      stateFilterId: string;
    }[];
    setMultiple?: string[];
    setFilterValues?: {
      [k: string]: string[];
    };
    setHidden?: string[];
    customPlotEffect?: {
      row: string[];
      column: string[];
    };
  };
  plotSettings: {
    id: string;
    label: string;
    options: {
      id: string;
      label: string;
      effect: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
    }[];
    value?: string;
    hidden?: boolean;
  }[];
}
export interface PlottingMetadataResponse {
  survey: Metadata;
  anc: Metadata;
  programme: Metadata;
  output: Metadata;
}
export interface Metadata {
  choropleth: {
    indicators: {
      indicator: string;
      value_column: string;
      error_low_column?: string;
      error_high_column?: string;
      indicator_column?: string;
      indicator_value?: string;
      indicator_sort_order?: number;
      name: string;
      min: number;
      max: number;
      colour: string;
      invert_scale: boolean;
      scale: number;
      accuracy: number | null;
      format: string;
    }[];
    [k: string]: any;
  };
  [k: string]: any;
}
export type PopulationResponseData = null;
export interface PrerunRequest {
  inputs: {
    pjnz: {
      path: string | null;
      filename: string;
    };
    population: {
      path: string | null;
      filename: string;
    };
    shape: {
      path: string | null;
      filename: string;
    };
    survey: {
      path: string | null;
      filename: string;
    };
    programme?: {
      path: string | null;
      filename: string;
    };
    anc?: {
      path: string | null;
      filename: string;
    };
  };
  outputs: {
    fit_model_output: {
      path: string | null;
      filename: string;
    };
    calibrate_plot_data: {
      path: string | null;
      filename: string;
    };
    calibrate_model_output: {
      path: string | null;
      filename: string;
    };
  };
}
export interface ProgrammeDataRow {
  area_id: string;
  calendar_quarter: string;
  sex: string;
  age_group: string;
  art_current: number;
  [k: string]: any;
}
export interface ProgrammeFilters {
  age: {
    label: string;
    id: string;
    description?: string;
  }[];
  calendar_quarter: {
    label: string;
    id: string;
    description?: string;
  }[];
  indicators: {
    label: string;
    id: string;
    description?: string;
  }[];
}
export type ProgrammeResponseData = {
  area_id: string;
  calendar_quarter: string;
  sex: string;
  age_group: string;
  art_current: number;
  [k: string]: any;
}[];
export interface ProgressPhase {
  started: boolean;
  complete: boolean;
  value?: number;
  name: string;
  helpText?: string;
}
export interface ProjectRehydrateResultResponse {
  notes: string | null;
  state: {
    datasets: {
      pjnz: {
        path: string | null;
        filename: string;
      };
      population: {
        path: string | null;
        filename: string;
      };
      shape: {
        path: string | null;
        filename: string;
      };
      survey: {
        path: string | null;
        filename: string;
      };
      programme?: {
        path: string | null;
        filename: string;
      };
      anc?: {
        path: string | null;
        filename: string;
      };
    };
    model_fit: {
      options: {
        [k: string]: any;
      };
      id: string;
    };
    calibrate: {
      options: {
        [k: string]: any;
      };
      id: string;
    };
    version: {
      hintr: string;
      naomi: string;
      rrq: string;
      [k: string]: any;
    };
  };
}
export interface ProjectRehydrateStatusResponse {
  id: string;
  done: boolean | null;
  status: string;
  success: boolean | null;
  queue: number;
  progress: (
    | {
        started: boolean;
        complete: boolean;
        value?: number;
        name: string;
        helpText?: string;
      }
    | string
  )[];
}
export interface ProjectRehydrateSubmitRequest {
  file: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
}
export interface ProjectRehydrateSubmitResponse {
  id: string;
}
export interface ProjectState {
  datasets: {
    pjnz: {
      path: string | null;
      filename: string;
    };
    population: {
      path: string | null;
      filename: string;
    };
    shape: {
      path: string | null;
      filename: string;
    };
    survey: {
      path: string | null;
      filename: string;
    };
    programme?: {
      path: string | null;
      filename: string;
    };
    anc?: {
      path: string | null;
      filename: string;
    };
  };
  model_fit: AsyncRunOptions;
  calibrate: AsyncRunOptions;
  version: {
    hintr: string;
    naomi: string;
    rrq: string;
    [k: string]: any;
  };
}
export interface AsyncRunOptions {
  options: {
    [k: string]: any;
  };
  id: string;
}
export interface Response {
  status: "success" | "failure";
  data: {
    [k: string]: any;
  } | null;
  errors: {
    error: string;
    detail: string | null;
    key?: string;
    job_id?: string;
    [k: string]: any;
  }[];
  version?: {
    hintr: string;
    naomi: string;
    rrq: string;
    [k: string]: any;
  };
}
export interface ReviewInputFilterMetadataRequest {
  iso3: string;
  data: {
    shape?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    programme?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    anc?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    survey?: {
      path: string | null;
      hash: string;
      filename: string;
      fromADR?: boolean;
      resource_url?: string | null;
    };
    [k: string]: any;
  };
}
export interface ReviewInputFilterMetadataResponse {
  filterTypes: {
    id: string;
    column_id: string;
    options: {
      label: string;
      id: string;
      description?: string;
    }[];
    use_shape_regions?: boolean;
  }[];
  indicators: {
    indicator: string;
    value_column: string;
    error_low_column?: string;
    error_high_column?: string;
    indicator_column?: string;
    indicator_value?: string;
    indicator_sort_order?: number;
    name: string;
    min: number;
    max: number;
    colour: string;
    invert_scale: boolean;
    scale: number;
    accuracy: number | null;
    format: string;
  }[];
  plotSettingsControl: {
    timeSeries: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
    inputChoropleth: {
      defaultEffect?: {
        setFilters?: {
          filterId: string;
          label: string;
          stateFilterId: string;
        }[];
        setMultiple?: string[];
        setFilterValues?: {
          [k: string]: string[];
        };
        setHidden?: string[];
        customPlotEffect?: {
          row: string[];
          column: string[];
        };
      };
      plotSettings: {
        id: string;
        label: string;
        options: {
          id: string;
          label: string;
          effect: {
            setFilters?: {
              filterId: string;
              label: string;
              stateFilterId: string;
            }[];
            setMultiple?: string[];
            setFilterValues?: {
              [k: string]: string[];
            };
            setHidden?: string[];
            customPlotEffect?: {
              row: string[];
              column: string[];
            };
          };
        }[];
        value?: string;
        hidden?: boolean;
      }[];
    };
  };
  [k: string]: any;
}
export interface SessionFile {
  path: string | null;
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
}
/**
 * TODO: Validate against a URL e.g. https://geojson.org/schema/FeatureCollection.json
 */
export interface GeoJSONObject {
  type: "FeatureCollection";
  crs?: {
    [k: string]: any;
  };
  name?: string;
  features: {
    [k: string]: any;
  }[];
  [k: string]: any;
}
export interface SurveyDataRow {
  indicator: string;
  survey_id: string;
  survey_year?: number;
  area_id: string;
  sex: string;
  age_group: string;
  n_clusters: number;
  n_observations: number;
  n_eff_kish?: number;
  estimate: number;
  std_error: number;
  ci_lower: number | null;
  ci_upper: number | null;
  [k: string]: any;
}
export interface SurveyFilters {
  age: {
    label: string;
    id: string;
    description?: string;
  }[];
  surveys: {
    label: string;
    id: string;
    description?: string;
  }[];
  indicators: {
    label: string;
    id: string;
    description?: string;
  }[];
}
export type SurveyResponseData = {
  indicator: string;
  survey_id: string;
  survey_year?: number;
  area_id: string;
  sex: string;
  age_group: string;
  n_clusters: number;
  n_observations: number;
  n_eff_kish?: number;
  estimate: number;
  std_error: number;
  ci_lower: number | null;
  ci_upper: number | null;
  [k: string]: any;
}[];
export type URI = string;
export interface ValidateBaselineRequest {
  pjnz: string | null;
  shape: string | null;
  population: string | null;
}
export interface ValidateBaselineResponse {
  consistent: boolean;
}
export interface ValidateInputRequest {
  type: "pjnz" | "shape" | "population" | "survey" | "programme" | "anc" | "vmmc";
  file: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
}
export type ValidateInputResponse =
  | PjnzResponse
  | ShapeResponse
  | PopulationResponse
  | ProgrammeResponse
  | AncResponse
  | SurveyResponse
  | VmmcResponse;

export interface PjnzResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "pjnz";
  data: {
    country: string;
    iso3: string;
  };
  filters?: null;
}
export interface ShapeResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "shape";
  data: GeoJSONObject;
  filters: {
    level_labels?: {
      id: number;
      area_level_label: string;
      display: boolean;
    }[];
    regions?: {
      label: string;
      id: string;
      children?: {
        [k: string]: any;
      }[];
    };
    [k: string]: any;
  };
}
/**
 * TODO: Validate against a URL e.g. https://geojson.org/schema/FeatureCollection.json
 */
export interface GeoJSONObject {
  type: "FeatureCollection";
  crs?: {
    [k: string]: any;
  };
  name?: string;
  features: {
    [k: string]: any;
  }[];
  [k: string]: any;
}
export interface PopulationResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "population";
  data: null;
  filters?: null;
}
export interface ProgrammeResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "programme";
  data: {
    area_id: string;
    calendar_quarter: string;
    sex: string;
    age_group: string;
    art_current: number;
    [k: string]: any;
  }[];
  filters: {
    age: {
      label: string;
      id: string;
      description?: string;
    }[];
    calendar_quarter: {
      label: string;
      id: string;
      description?: string;
    }[];
    indicators: {
      label: string;
      id: string;
      description?: string;
    }[];
  };
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface AncResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "anc";
  data: {
    area_id: string;
    age_group: string;
    year: number;
    anc_clients: number;
    anc_hiv_status?: number;
    anc_known_pos: number;
    anc_already_art: number;
    anc_tested: number;
    anc_tested_pos: number;
    anc_prevalence: number;
    anc_art_coverage: number;
    [k: string]: any;
  }[];
  filters: {
    year: {
      label: string;
      id: string;
      description?: string;
    }[];
    indicators: {
      label: string;
      id: string;
      description?: string;
    }[];
  };
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface SurveyResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "survey";
  data: {
    indicator: string;
    survey_id: string;
    survey_year?: number;
    area_id: string;
    sex: string;
    age_group: string;
    n_clusters: number;
    n_observations: number;
    n_eff_kish?: number;
    estimate: number;
    std_error: number;
    ci_lower: number | null;
    ci_upper: number | null;
    [k: string]: any;
  }[];
  filters: {
    age: {
      label: string;
      id: string;
      description?: string;
    }[];
    surveys: {
      label: string;
      id: string;
      description?: string;
    }[];
    indicators: {
      label: string;
      id: string;
      description?: string;
    }[];
  };
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface VmmcResponse {
  hash: string;
  filename: string;
  fromADR?: boolean;
  resource_url?: string | null;
  type: "vmmc";
  data: null;
  filters: null;
  warnings: {
    text: string;
    locations: (
      | "review_inputs"
      | "model_options"
      | "model_fit"
      | "model_calibrate"
      | "review_output"
      | "download_results"
    )[];
  }[];
}
export interface ValidateSurveyAndProgrammeRequest {
  type: "pjnz" | "shape" | "population" | "survey" | "programme" | "anc" | "vmmc";
  file: {
    path: string | null;
    hash: string;
    filename: string;
    fromADR?: boolean;
    resource_url?: string | null;
  };
  shape: string | null;
}
export interface VersionInfo {
  hintr: string;
  naomi: string;
  rrq: string;
  [k: string]: any;
}
export type VmmcResponseData = null;
export interface Warning {
  text: string;
  locations: (
    | "review_inputs"
    | "model_options"
    | "model_fit"
    | "model_calibrate"
    | "review_output"
    | "download_results"
  )[];
}
