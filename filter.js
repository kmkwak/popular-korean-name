var NAME_LIST_TEMPLATE =
    '<% _.each(nameList, function(name) { %>' +
    '<li>' +
        '<span style="color: dodgerblue;">곽<%= name.name %></span>' +
        '<div style="color: darkgray;">count: <%= name.count %>, ranking: <%= name.rank %></div>' +
        '<div style="color: darkgray;"><%= name.ohang %></div>' +
        '<div style="color: darkgray;"><%= name.umYang %></div>' +
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

// 초성
var cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ];
// 중성
var cJung = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

// 모음 음양
var UM_YANG = {
    UM: ["ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"],
    YANG: ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ"]
};

/**
 *  목 : ㄱ, ㅋ
 *  화 : ㄴ, ㄷ, ㄹ, ㅌ
 *  토 : ㅇ, ㅎ
 *  금 : ㅅ, ㅈ, ㅊ
 *  수 : ㅁ, ㅂ, ㅍ
 */
var O_HANG_MATCH = {
    'ㄱ': '목',
    'ㄴ': '화',
    'ㄷ': '화',
    'ㄹ': '화',
    'ㅁ': '수',
    'ㅂ': '수',
    'ㅅ': '금',
    'ㅇ': '토',
    'ㅈ': '금',
    'ㅊ': '금',
    'ㅋ': '목',
    'ㅌ': '화',
    'ㅍ': '수',
    'ㅎ': '토'
};

/**
 * 목오행 길흉 테이블
 * 상비관계 : 1개
 * 상생관계 : 8개
 * 생극관계 : 8개
 * 상극관계 : 8개
 */
var O_HANG_RELATION = {
    '목': {
        '목': {
            '목': 'WORST',
            '화': 'BEST',
            '토': 'WORST',
            '금': 'WORST',
            '수': 'BEST'
        },
        '화': {
            '목': 'BEST',
            '화': 'BEST',
            '토': 'BEST',
            '금': 'BAD',
            '수': 'GOOD'
        },
        '토': {
            '목': 'WORST',
            '화': 'GOOD',
            '토': 'WORST',
            '금': 'BAD',
            '수': 'WORST'
        },
        '금': {
            '목': 'WORST',
            '화': 'WORST',
            '토': 'BAD',
            '금': 'WORST',
            '수': 'GOOD'
        },
        '수': {
            '목': 'BEST',
            '화': 'GOOD',
            '토': 'BAD',
            '금': 'BEST',
            '수': 'BEST'
        }
    }
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

function getOhangRelationResult(choSungList) {
    var first = 'ㄱ';
    var middle = choSungList[0];
    var last = choSungList[1];
    return O_HANG_RELATION[O_HANG_MATCH[first]][O_HANG_MATCH[middle]][O_HANG_MATCH[last]];
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

        var ohangRelationResult = getOhangRelationResult(choSungList);
        if (ohangRelationResult !== 'BEST' && ohangRelationResult !== 'GOOD') {
            return false;
        }
        if (selectedBestGoodFilter !== 'ALL' && selectedBestGoodFilter !== ohangRelationResult) {
            return false;
        }

        var jungSungList = extractJungSungList(item.name);
        if (!umYangFilter(jungSungList)) {
            return false;
        }
        item.ohang = '[발음 오행] ' + ohangRelationResult + ' : ' + [O_HANG_MATCH['ㄱ'], O_HANG_MATCH[choSungList[0]], O_HANG_MATCH[choSungList[1]]].join('-');
        item.umYang = '[발음 음양] BEST';
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