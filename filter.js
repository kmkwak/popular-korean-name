var NAME_LIST_TEMPLATE =
    '<% _.each(nameList, function(name) { %>' +
    '<li>' +
        '<span style="color: dodgerblue;">곽<%= name.name %></span> : ' +
        '<span style="color: darkgray;">[<%= name.choSung.join(",") %>], <%= name.ohang %>, [count: <%= name.count %>], [ranking: <%= name.rank %>]</span>' +
    '</li>' +
    '<% }); %>';

function requestNameList(page) {
    $('#moreBtn').prop('disabled', true);
    var startYear = $('#startYearSelect option:selected').val();
    var endYear = $('#endYearSelect option:selected').val();
    return $.getJSON('https://koreanname.me/api/rank/'+ startYear +'/' + endYear + '/' + page)
        .done(function(resultData) {
            var nameList = filter(resultData.female);
            $('#resultList').append(_.template(NAME_LIST_TEMPLATE)({nameList:nameList}));
            $('#moreBtn').prop('disabled', false);
        });
}

var cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ];
var cJung = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

var O_HANG = {
    MOK: ['ㄱ', 'ㅋ'],
    HWA: ['ㄴ', 'ㄷ', 'ㄹ', 'ㅌ'],
    TO: ['ㅇ', 'ㅎ'],
    KUM: ['ㅅ', 'ㅈ', 'ㅊ'],
    SU: ['ㅁ', 'ㅂ', 'ㅍ']
};

var UM_YANG = {
    UM: ["ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"],
    YANG: ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ"]
};

function extractChoSungList(name) {
    return _.map(name, function(item, index) {
        var cCode = item.charCodeAt(0) - 0xAC00;
        var jong = cCode % 28; // 종성
        var jung = ((cCode - jong) / 28 ) % 21; // 중성
        var cho = (((cCode - jong) / 28 ) - jung ) / 21; // 초성

        return cCho[cho];
    });
}

function extractJungSungList(name) {
    return _.map(name, function(item, index) {
        var cCode = item.charCodeAt(0) - 0xAC00;
        var jong = cCode % 28; // 종성
        var jung = ((cCode - jong) / 28 ) % 21; // 중성
        var cho = (((cCode - jong) / 28 ) - jung ) / 21; // 초성

        return cJung[jung];
    });
}



function ohangBestFilter(choSungList) {
    var middle = choSungList[0];
    var last = choSungList[1];
    // 목, 목, 화
    if (_.contains(O_HANG.MOK, middle) && _.contains(O_HANG.HWA, last)) {
        return '[BEST: 목-목-화]';
    }
    // 목, 목, 수
    if (_.contains(O_HANG.MOK, middle) && _.contains(O_HANG.SU, last)) {
        return '[BEST: 목-목-수]';
    }
    // 목, 화, 목
    if (_.contains(O_HANG.HWA, middle) && _.contains(O_HANG.MOK, last)) {
        return '[BEST: 목-화-목]';
    }
    // 목, 화, 화
    if (_.contains(O_HANG.HWA, middle) && _.contains(O_HANG.HWA, last)) {
        return '[BEST: 목-화-화]';
    }
    // 목, 화, 토
    if (_.contains(O_HANG.HWA, middle) && _.contains(O_HANG.TO, last)) {
        return '[BEST: 목-화-토]';
    }
    // 목, 수, 목
    if (_.contains(O_HANG.SU, middle) && _.contains(O_HANG.MOK, last)) {
        return '[BEST: 목-수-목]';
    }
    // 목, 수, 금
    if (_.contains(O_HANG.SU, middle) && _.contains(O_HANG.KUM, last)) {
        return '[BEST: 목-수-금]';
    }
    // 목, 수, 수
    if (_.contains(O_HANG.SU, middle) && _.contains(O_HANG.SU, last)) {
        return '[BEST: 목-수-수]';
    }

    return '';
}

function ohangGoodFilter(choSungList) {
    var middle = choSungList[0];
    var last = choSungList[1];

    // 목, 화, 수
    if (_.contains(O_HANG.HWA, middle) && _.contains(O_HANG.SU, last)) {
        return '[GOOD: 목-화-수]';
    }
    // 목, 토, 화
    if (_.contains(O_HANG.TO, middle) && _.contains(O_HANG.HWA, last)) {
        return '[GOOD: 목-토-화]';
    }
    // 목, 금, 수
    if (_.contains(O_HANG.KUM, middle) && _.contains(O_HANG.SU, last)) {
        return '[GOOD: 목-금-수]';
    }
    // 목, 수, 화
    if (_.contains(O_HANG.SU, middle) && _.contains(O_HANG.HWA, last)) {
        return '[GOOD: 목-수-화]';
    }

    return '';
}

function umYangFilter(jungSungList) {
    var last = jungSungList[1];
    if (_.contains(UM_YANG.UM, last)) {
        return true;
    }
    return false;
}

function filter(nameList) {
    return _.filter(nameList, function(item) {
        var choSungList = extractChoSungList(item.name);
        var selectedBestGoodFilter = $('#bestGoodFilterSelect option:selected').val();

        var filterResult = '';
        if (selectedBestGoodFilter === 'best') {
            filterResult = ohangBestFilter(choSungList);
        } else if (selectedBestGoodFilter === 'good') {
            filterResult = ohangGoodFilter(choSungList);
        } else {
            filterResult = ohangBestFilter(choSungList) || ohangGoodFilter(choSungList);
        }

        if (!filterResult) {
            return false;
        }

        var jungSungList = extractJungSungList(item.name);
        if (!umYangFilter(jungSungList)) {
            return false;
        }
        item.choSung = choSungList;
        item.ohang = filterResult;
        return true;
    });
}

$('document').ready(function() {
    requestNameList(1);

    $('#moreBtn').click(function(e) {
        var btn = $(e.target);
        btn.prop('disabled', true);
        var requestPage = btn.data('nextPage');
        btn.data('nextPage', requestPage + 1);
        requestNameList(requestPage);
    });

    $('#startYearSelect, #endYearSelect, #bestGoodFilterSelect').change(function() {
        $('#resultList').empty();
        $('#moreBtn').data('nextPage', 2);
        requestNameList(1);
    });
});