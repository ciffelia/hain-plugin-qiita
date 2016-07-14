'use strict';

const request = require('request');

module.exports = (pluginContext) => (query, res) => {
  const arg = query.match(/(\w+)\s*(.*)/) || [query, ''];

  const preferences = pluginContext.preferences;

  switch (arg[1]) {
    case 'search': {
      // 検索クエリが指定されていない場合はreturn
      if(!arg[2]) {
        return;
      }

      const searchQuery = arg[2];

      // Search on Qiita.com表示を追加
      res.add({
        id: 'searchOnQiitaWeb',
        payload: { openUrl: 'http://qiita.com/search?q=' + encodeURIComponent(searchQuery) },
        title: 'Search on Qiita',
        desc: 'Search on qiita.com'
      });

      // Searching表示を追加
      res.add({
        id: 'searching',
        title: `Searching ${searchQuery}...`,
        desc: 'Please wait a second'
      });

      // 検索クエリを送信
      request({
        uri: 'https://qiita.com/api/v2/items',
        json: true,
        qs: {
          page: 1,
          per_page: 20,
          query: searchQuery
        },
        headers: {
          'Authorization': 'Bearer ' + preferences.get('accessToken')
        }
      }, function (error, response, body) {
        // Searching表示を削除
        res.remove('searching');

        if (error) {
          // エラーの場合
          res.add({
            id: 'failed',
            title: `Failed to search ${searchQuery} (Network error)`
          });
        } else if (error || response.statusCode !== 200) {
          // エラーの場合
          res.add({
            id: 'failed',
            title: `Failed to search ${searchQuery} (HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage})`
          });
        } else {
          body.forEach((val, i) => {
            const tags = val.tags.map((tag) => {
              return '<i class="fa fa-tag" aria-hidden="true"></i>' + tag.name;
            }).join(' ');

            res.add({
              id: i.toString(),
              payload: { openUrl: val.url },
              title: val.title,
              desc: `<i class="fa fa-user" aria-hidden="true"></i>${val.user.name ? val.user.name : '@' + val.user.id} ${tags}`
            });
          });
        }
      });
      break;
    }

    case 'stocks': {
      var stockUser = '';
      if(arg[2]) {
        stockUser = arg[2];
      } else if (preferences.get('userId') !== '') {
        stockUser = preferences.get('userId');
      } else {
        // TODO: /api/v2/authenticated_user からユーザー情報を取得
      }

      // View on Qiita表示を追加
      res.add({
        id: 'viewOnQiitaWeb',
        payload: { openUrl: `https://qiita.com/${stockUser}/stock` },
        title: 'View on Qiita',
        desc: 'View on qiita.com'
      });

      // Fetching表示を追加
      res.add({
        id: 'fetching',
        title: `Fetching from qiita.com...`,
        desc: 'Please wait a second'
      });

      // ストック情報を取得
      request({
        uri: `https://qiita.com/api/v2/users/${stockUser}/stocks`,
        json: true,
        qs: {
          page: 1,
          per_page: 20
        },
        headers: {
          'Authorization': 'Bearer ' + preferences.get('accessToken')
        }
      }, function (error, response, body) {
        // Searching表示を削除
        res.remove('fetching');

        if (error) {
          // エラーの場合
          res.add({
            id: 'failed',
            title: 'Failed to fetch from qiita.com (Network error)'
          });
        } else if (error || response.statusCode !== 200) {
          // エラーの場合
          res.add({
            id: 'failed',
            title: `Failed to fetch from qiita.com (HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage})`
          });
        } else {
          body.forEach((val, i) => {
            const tags = val.tags.map((tag) => {
              return '<i class="fa fa-tag" aria-hidden="true"></i>' + tag.name;
            }).join(' ');

            res.add({
              id: i.toString(),
              payload: { openUrl: val.url },
              title: val.title,
              desc: `<i class="fa fa-user" aria-hidden="true"></i>${val.user.name ? val.user.name : '@' + val.user.id} ${tags}`
            });
          });
        }
      });
      break;
    }
    default: {
      // コマンドのヘルプを表示
      res.add({
        id: 'stocksHelp',
        payload: { command: '/qiita stocks' },
        title: 'View stocks',
        desc: 'View stocks'
      });
      res.add({
        id: 'searchHelp',
        payload: { command: '/qiita search' },
        title: 'Search articles',
        desc: 'Search articles'
      });
    }
  }
};
