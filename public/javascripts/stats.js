const STAT_FILTERS_DIV_ID = "stat-filters";

const STAT_NAME_FILTER_SELECT_ID = "stat-name-filter-select";
const WIN_RATE_NAME_STAT_OPTION = "win-rate";
const WIN_RATE_NAME_STAT_OPTION_TEXT = "Win Rate";
const ASSASSINATION_RATE_NAME_STAT_OPTION = "assassination-rate";
const ASSASSINATION_RATE_NAME_STAT_OPTION_TEXT = "Assassination Rate";

const STAT_FOR_FILTER_SELECT_ID = "stat-for-filter-select";
const ROLE_FOR_STAT_OPTION = "role";
const ROLE_FOR_STAT_OPTION_TEXT = "Role";
const TEAM_FOR_STAT_OPTION = "team";
const TEAM_FOR_STAT_OPTION_TEXT = "Team";
const ASSASSINATOR_FOR_STAT_OPTION = "assassinator";
const ASSASSINATOR_FOR_STAT_OPTION_TEXT = "Assassinator";
const ASSASSINATED_FOR_STAT_OPTION = "assassinated";
const ASSASSINATED_FOR_STAT_OPTION_TEXT = "Assassinated";

const STAT_BY_FILTER_SELECT_ID = "stat-by-filter-select";
const OVERALL_BY_STAT_OPTION = "overall";
const OVERALL_BY_STAT_OPTION_TEXT = "Overall";
const PLAYER_BY_STAT_OPTION = "player";
const PLAYER_BY_STAT_OPTION_TEXT = "Player";
const ROLE_BY_STAT_OPTION = "role";
const ROLE_BY_STAT_OPTION_TEXT = "Role";

const STAT_ADDITIONAL_FILTER_SELECT_ID = "stat-additional-filter-select";

const STAT_TABLE_ID = "stat-table";

const TABLE_DESC_ASC_ORDERING = { 
    "orderSequence": [ "desc", "asc" ]
};
const WIN_PLAYER_OPTIONS = {
    "columns": [
        { title: 'Player' },
        { title: 'Wins' },
        { title: 'Losses' },
        { title: 'Win Rate' }
    ],
    "scrollX": true,
    "aoColumns": [
        null,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING
    ]
};
const WIN_TEAM_OPTIONS = {
    "columns": [
        { title: 'Team' },
        { title: 'Wins' },
        { title: 'Losses' },
        { title: 'Win Rate' }
    ],
    "scrollX": true,
    "paging": false,
    "info": false,
    "searching": false,
    "aoColumns": [
        null,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING
    ]
};
const WIN_ROLE_OPTIONS = {
    "columns": [
        { title: 'Role' },
        { title: 'Wins' },
        { title: 'Losses' },
        { title: 'Win Rate' }
    ],
    "scrollX": true,
    "paging": false,
    "info": false,
    "searching": false,
    "aoColumns": [
        null,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING
    ]
};
const ASSASSINATION_PLAYER_OPTIONS = {
    "columns": [
        { title: 'Player' },
        { title: 'Successes' },
        { title: 'Fails' },
        { title: 'Success Rate' }
    ],
    "scrollX": true,
    "aoColumns": [
        null,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING
    ]
};
const ASSASSINATION_ROLE_OPTIONS = {
    "columns": [
        { title: 'Role' },
        { title: 'Successes' },
        { title: 'Fails' },
        { title: 'Success Rate' }
    ],
    "scrollX": true,
    "paging": false,
    "info": false,
    "searching": false,
    "aoColumns": [
        null,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING,
        TABLE_DESC_ASC_ORDERING
    ]
};

const RESISTANCE_ROLES = [
    "Merlin",
    "Arthur",
    "Tristan",
    "Iseult",
    "Lancelot",
    "Percival",
    "Uther",
    "Guinevere",
    "Jester",
    "Puck",
    "Galahad",
    "Bedivere",
    "Titania",
    "Ector",
    "Geraint",
    "Gaheris",
    "Kay",
    "Sir Robin",
    "Lamorak",
    "Bors"
]
const RESISTANCE_KEY_WORDS = [
    "Resistance",
    "Lovers"
];
Array.prototype.push.apply(RESISTANCE_KEY_WORDS, RESISTANCE_ROLES);

const SPY_ROLES = [
    "Accolon",
    "Colgrevance",
    "Lucius",
    "Maelagant",
    "Mordred",
    "Morgana",
    "Cerdic",
    "Cynric",
    "Ryons"
];
const SPY_KEY_WORDS = [
    "Spies"    
];
Array.prototype.push.apply(SPY_KEY_WORDS, SPY_ROLES);

function createLabel(text, styleClasses) {
    const labelElement = document.createElement('label');
    labelElement.innerText = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            labelElement.classList.add(styleClass);
        }
    }
    return labelElement;
}

function createOption(value, text) {
    const optionElement = document.createElement('option');
    optionElement.value = value;
    if (text) {
        optionElement.innerText = text;
    }
    return optionElement;
}

function createDefaultOption(text) {
    const defaultOptionElement = createOption("none", text);
    defaultOptionElement.disabled = true;
    return defaultOptionElement;
}

function createSelect(id) {
    const selectElement = document.createElement('select');
    if (id) {
        selectElement.id = id;
    }
    return selectElement;
}

function addClassToElement(element, className) {
    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function removeClassFromElement(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

function clearChildrenFromElement(element) {
    while (element.children.length > 0) {
        element.removeChild(element.lastChild);
    }
}

function getDataForTable(postDataRequestUrl, postParameters, callback) {
    let dataRequest = new XMLHttpRequest();
    dataRequest.open("POST", postDataRequestUrl, true);
    dataRequest.setRequestHeader("Content-Type", "application/json");
    dataRequest.onreadystatechange = function () {
        if (dataRequest.readyState === 4 && dataRequest.status === 200) {
            callback(JSON.parse(dataRequest.responseText));
        }
    };

    if (postParameters) {
        dataRequest.send(JSON.stringify(postParameters));
    } else {
        dataRequest.send();
    }
}

function createRolePlayerStatsTable() {
    const tableId = "role-player-stats";
    const tableColumns = ["Name", "Wins", "Losses", "Win Rate"];
    const tableOptions = {
        "scrollX": true,
        "aoColumns": [
            null,
            TABLE_DESC_ASC_ORDERING,
            TABLE_DESC_ASC_ORDERING,
            TABLE_DESC_ASC_ORDERING
        ]
    };
    const tableHeaderText = "Role Wins/Losses";
    const postDataRequestUrl = "/stats/role-player";
    const postParameters = {"role": "Merlin"};

    const tab = document.getElementById(PLAYER_TAB_ID);
    const tableHeader = createHeader(null, tableHeaderText, ["future-header"]);
    tab.appendChild(tableHeader);
    const tabTable = createTable(tableId, TABLE_STYLE_CLASSES, tableColumns);
    tabTable.style.width = "100%"
    tab.appendChild(tabTable);

    getDataForTable(postDataRequestUrl, postParameters, data => {
        addDataToTable(tableId, data, tableOptions);

        const roleSelectionDiv = createDiv(null, ["dataTables_selector"]);
        const roleSelect = createRoleSelect();
        roleSelect.onchange = function () {
            updateRolePlayerStatsTable(roleSelect.value);
        };
        roleSelectionDiv.appendChild(createLabel("Select Role:", ["future-header"]));
        roleSelectionDiv.appendChild(roleSelect);

        const roleStatsFilterDiv = document.getElementById(`${tableId}_filter`);
        roleStatsFilterDiv.parentNode.insertBefore(roleSelectionDiv, roleStatsFilterDiv.nextSibling);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const statFiltersDiv = document.getElementById(STAT_FILTERS_DIV_ID);
    const statNameFilterSelect = document.getElementById(STAT_NAME_FILTER_SELECT_ID);
    const statForFilterSelect = document.getElementById(STAT_FOR_FILTER_SELECT_ID);
    const statByFilterSelect = document.getElementById(STAT_BY_FILTER_SELECT_ID);
    let statAdditionalFilterDiv = null;
    let statAdditionalFilterSelect = null;
    let statTable = document.getElementById(STAT_TABLE_ID);
    statTable.style.width = "100%";

    let currentStatNameSelected = WIN_RATE_NAME_STAT_OPTION;
    let currentStatForSelected = null;
    let currentStatBySelected = null;
    let currentStatAdditionalFilterSelected = null;

    function handleStatNameSelect() {
        if (currentStatNameSelected !== statNameFilterSelect.value) {
            currentStatNameSelected = statNameFilterSelect.value;
            setupForFilterSelect();
        }
    }

    function handleStatForSelect() {
        if (currentStatForSelected !== statForFilterSelect.value) {
            currentStatForSelected = statForFilterSelect.value;
            setupByFilterSelect();
        }
    }

    function handleStatBySelect() {
        if (currentStatBySelected !== statByFilterSelect.value) {
            currentStatBySelected = statByFilterSelect.value;
            if (currentStatNameSelected === WIN_RATE_NAME_STAT_OPTION && currentStatBySelected === PLAYER_BY_STAT_OPTION) {
                if (currentStatForSelected === ROLE_FOR_STAT_OPTION) {
                    setupAdditionalFilterSelect("Role:");
                } else if (currentStatForSelected === TEAM_FOR_STAT_OPTION) {
                    setupAdditionalFilterSelect("Team:");
                }
            } else {
                if (statAdditionalFilterDiv) {
                    statFiltersDiv.removeChild(statFiltersDiv.lastChild);
                    statAdditionalFilterDiv = null;
                    statAdditionalFilterSelect = null;
                    currentStatAdditionalFilterSelected = null;
                }
                updateTable();
            }
        }
    }

    function handleStatAdditionalSelect() {
        if (currentStatAdditionalFilterSelected !== statAdditionalFilterSelect.value) {
            currentStatAdditionalFilterSelected = statAdditionalFilterSelect.value;
            if (currentStatForSelected === ROLE_FOR_STAT_OPTION) {
                updateTable({role: currentStatAdditionalFilterSelected});
            } else if (currentStatForSelected === TEAM_FOR_STAT_OPTION) {
                updateTable({team: currentStatAdditionalFilterSelected});
            }
        }
    }

    function updateTable(postParameters) {
        let currentTableInformation = getTableInformationFromFilters();
        for (let i = 0; i < currentTableInformation.options.columns.length; i++) {
            const columnName = currentTableInformation.options.columns[i].title;
            statTable.column(i).header().innerText = columnName;
        }

        statTable.clear();
        getDataForTable(currentTableInformation.postDataRequestUrl, postParameters, data => {
            statTable.rows.add(data).draw();
        });
    }

    statNameFilterSelect.onchange = handleStatNameSelect;
    statForFilterSelect.onchange = handleStatForSelect;
    statByFilterSelect.onchange = handleStatBySelect;

    function setupForFilterSelect() {
        clearChildrenFromElement(statForFilterSelect);
        clearChildrenFromElement(statByFilterSelect);
        if (statAdditionalFilterDiv) {
            statFiltersDiv.removeChild(statFiltersDiv.lastChild);
            statAdditionalFilterDiv = null;
            statAdditionalFilterSelect = null;
            currentStatAdditionalFilterSelected = null;
        }
        switch (currentStatNameSelected) {
            case WIN_RATE_NAME_STAT_OPTION:
                statForFilterSelect.appendChild(createDefaultOption(""));
                statForFilterSelect.appendChild(createOption(ROLE_FOR_STAT_OPTION, ROLE_FOR_STAT_OPTION_TEXT));
                statForFilterSelect.appendChild(createOption(TEAM_FOR_STAT_OPTION, TEAM_FOR_STAT_OPTION_TEXT));
                break;
            case ASSASSINATION_RATE_NAME_STAT_OPTION:
                statForFilterSelect.appendChild(createDefaultOption(""));
                statForFilterSelect.appendChild(createOption(ASSASSINATOR_FOR_STAT_OPTION, ASSASSINATOR_FOR_STAT_OPTION_TEXT));
                statForFilterSelect.appendChild(createOption(ASSASSINATED_FOR_STAT_OPTION, ASSASSINATED_FOR_STAT_OPTION_TEXT));
                break;
        }
        currentStatForSelected = null;
        currentStatBySelected = null;
        statForFilterSelect.selectedIndex = 0;
    }

    function setupByFilterSelect() {
        clearChildrenFromElement(statByFilterSelect);
        if (statAdditionalFilterDiv) {
            statFiltersDiv.removeChild(statFiltersDiv.lastChild);
            statAdditionalFilterDiv = null;
            statAdditionalFilterSelect = null;
            currentStatAdditionalFilterSelected = null;
        }
        switch (currentStatForSelected) {
            case ROLE_FOR_STAT_OPTION:
            case TEAM_FOR_STAT_OPTION:
                statByFilterSelect.appendChild(createDefaultOption(""));
                statByFilterSelect.appendChild(createOption(OVERALL_BY_STAT_OPTION, OVERALL_BY_STAT_OPTION_TEXT));
                statByFilterSelect.appendChild(createOption(PLAYER_BY_STAT_OPTION, PLAYER_BY_STAT_OPTION_TEXT));
                break;
            case ASSASSINATOR_FOR_STAT_OPTION:
                statByFilterSelect.appendChild(createDefaultOption(""));
                statByFilterSelect.appendChild(createOption(PLAYER_BY_STAT_OPTION, PLAYER_BY_STAT_OPTION_TEXT));
                break;
            case ASSASSINATED_FOR_STAT_OPTION:
                statByFilterSelect.appendChild(createDefaultOption(""));
                statByFilterSelect.appendChild(createOption(PLAYER_BY_STAT_OPTION, PLAYER_BY_STAT_OPTION_TEXT));
                statByFilterSelect.appendChild(createOption(ROLE_BY_STAT_OPTION, ROLE_BY_STAT_OPTION_TEXT));
                break;
        }
        currentStatBySelected = null;
        statByFilterSelect.selectedIndex = 0;
    }

    function setupAdditionalFilterSelect(text) {
        statAdditionalFilterDiv = document.createElement('div');
        statAdditionalFilterDiv.appendChild(createLabel(text, ["future-header"]));
        statAdditionalFilterSelect = createSelect(STAT_ADDITIONAL_FILTER_SELECT_ID);
        statAdditionalFilterSelect.onchange = handleStatAdditionalSelect;
        statAdditionalFilterSelect.appendChild(createDefaultOption(""));
        statAdditionalFilterDiv.appendChild(statAdditionalFilterSelect);
        statFiltersDiv.appendChild(statAdditionalFilterDiv);

        switch (currentStatForSelected) {
            case ROLE_FOR_STAT_OPTION:
                for (let resistanceRole of RESISTANCE_ROLES) {
                    statAdditionalFilterSelect.appendChild(createOption(resistanceRole, resistanceRole));
                }
                for (let spyRole of SPY_ROLES) {
                    statAdditionalFilterSelect.appendChild(createOption(spyRole, spyRole));
                }
                break;
            case TEAM_FOR_STAT_OPTION:
                statAdditionalFilterSelect.appendChild(createOption("Resistance", "Resistance"));
                statAdditionalFilterSelect.appendChild(createOption("Spies", "Spies"));
                break;
        }
        currentStatAdditionalFilterSelected = null;
        statAdditionalFilterSelect.selectedIndex = 0;
    }

    function getTableInformationFromFilters() {
        if (currentStatNameSelected === WIN_RATE_NAME_STAT_OPTION) {
            if (currentStatForSelected === ROLE_FOR_STAT_OPTION) {
                if (currentStatBySelected === OVERALL_BY_STAT_OPTION) {
                    return {
                        options: WIN_ROLE_OPTIONS,
                        postDataRequestUrl: "/stats/role"
                    };
                } else if (currentStatBySelected === PLAYER_BY_STAT_OPTION) {
                    if (currentStatAdditionalFilterSelected) {
                        return {
                            options: WIN_PLAYER_OPTIONS,
                            postDataRequestUrl: "/stats/role-player"
                        };
                    }
                }
            } else if (currentStatForSelected === TEAM_FOR_STAT_OPTION) {
                if (currentStatBySelected === OVERALL_BY_STAT_OPTION) {
                    return {
                        options: WIN_TEAM_OPTIONS,
                        postDataRequestUrl: "/stats/team"
                    };
                } else if (currentStatBySelected === PLAYER_BY_STAT_OPTION) {
                    if (currentStatAdditionalFilterSelected) {
                        return {
                            options: WIN_PLAYER_OPTIONS,
                            postDataRequestUrl: "/stats/team-player"
                        };
                    }
                }
            }
        } else if (currentStatNameSelected === ASSASSINATION_RATE_NAME_STAT_OPTION) {
            if (currentStatForSelected === ASSASSINATOR_FOR_STAT_OPTION) {
                if (currentStatBySelected === PLAYER_BY_STAT_OPTION) {
                    return {
                        options: ASSASSINATION_PLAYER_OPTIONS,
                        postDataRequestUrl: "/stats/player-assassination"
                    };
                }
            } else if (currentStatForSelected === ASSASSINATED_FOR_STAT_OPTION) {
                if (currentStatBySelected === PLAYER_BY_STAT_OPTION) {
                    return {
                        options: ASSASSINATION_PLAYER_OPTIONS,
                        postDataRequestUrl: "/stats/player-assassinated"
                    };
                } else if (currentStatBySelected === ROLE_BY_STAT_OPTION) {
                    return {
                        options: ASSASSINATION_ROLE_OPTIONS,
                        postDataRequestUrl: "/stats/role-assassinations"
                    };
                }
            }
        }
    
        return null;
    }

    // Setup Name Filter Select
    statNameFilterSelect.appendChild(createOption(WIN_RATE_NAME_STAT_OPTION, WIN_RATE_NAME_STAT_OPTION_TEXT));
    statNameFilterSelect.appendChild(createOption(ASSASSINATION_RATE_NAME_STAT_OPTION, ASSASSINATION_RATE_NAME_STAT_OPTION_TEXT));
    statNameFilterSelect.selectedIndex = 0;

    setupForFilterSelect();
    currentStatForSelected = ROLE_FOR_STAT_OPTION;
    statForFilterSelect.selectedIndex = 1;

    setupByFilterSelect();
    currentStatBySelected = OVERALL_BY_STAT_OPTION;
    statByFilterSelect.selectedIndex = 1;

    let currentTableInformation = getTableInformationFromFilters();
    getDataForTable(currentTableInformation.postDataRequestUrl, currentTableInformation.postParameters, data => {
        currentTableInformation.options.data = data;
        currentTableInformation.options.createdRow = function(row, data, dataIndex) {
            if (RESISTANCE_KEY_WORDS.includes(data[0])) {
                $('td', row).eq(0).addClass('resistance');
            } else if (SPY_KEY_WORDS.includes(data[0])) {
                $('td', row).eq(0).addClass('spy');
            }
        };
        statTable = $(`#${STAT_TABLE_ID}`).DataTable(currentTableInformation.options);
        statTable.columns.adjust();
    });
});
