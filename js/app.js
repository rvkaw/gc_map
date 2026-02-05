// 設定（csvPathは不要になります）
const CONFIG = {
  defaultLat: 35.6895,
  defaultLng: 139.6917,
  defaultZoom: 5,
};

let map;

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadCsvData();
});

function initMap() {
  map = L.map("map").setView(
    [CONFIG.defaultLat, CONFIG.defaultLng],
    CONFIG.defaultZoom,
  );
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

// ★ここを大幅変更
function loadCsvData() {
  // fetchを使わず、読み込み済みの変数 csvData を直接パースする
  Papa.parse(csvData.trim(), {
    // trim()で前後の余分な改行を削除
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      addMarkers(results.data);
    },
  });
}

/**
 * 3. マーカー描画処理
 * geo_confidenceが 'high' のデータのみを抽出し、
 * URLがある場合はタイトルをリンク化して表示します。
 */
function addMarkers(data) {
  const markers = L.layerGroup().addTo(map);

  data.forEach((row) => {
    // ★追加: フィルタリング処理
    // geo_confidence が 'high' 以外のデータはスキップ（returnで次のループへ）
    // データに余計な空白が入っている場合に備えて .trim() しています
    if (!row.geo_confidence || row.geo_confidence.trim() !== "high") {
      return;
    }

    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);

    // 座標が有効かチェック
    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng]);

      // タイトルのテキストを取得
      const titleText = row.title || "名称なし";

      // URLがある場合はaタグで囲む（前回の実装を維持）
      let titleHtml;
      if (row.url && row.url.trim() !== "") {
        titleHtml = `<a href="${row.url}" target="_blank" rel="noopener noreferrer" style="color: #0078A8; text-decoration: none; border-bottom: 1px solid #0078A8;">${titleText}</a>`;
      } else {
        titleHtml = titleText;
      }

      // descriptionを作成（前回の実装を維持）
      const description = `
                <div style="margin-bottom: 8px;"><strong>会社:</strong> ${row.会社 || "-"}</div>
                <div style="margin-bottom: 4px;"><strong>発注者:</strong> ${row.発注者 || "-"}</div>
                <div style="margin-bottom: 4px;"><strong>用途:</strong> ${row.用途 || "-"}</div>
                <div style="margin-bottom: 4px;"><strong>竣工年月:</strong> ${row.竣工年月 || "-"}</div>
                <div style="margin-top: 8px; border-top: 1px solid #ccc; padding-top: 4px; font-size: 0.9em; color: #555;">
                    ${row.備考 || ""}
                </div>
            `;

      // ポップアップ全体のHTML
      const popupContent = `
                <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 5px; border-bottom: 2px solid #eee; padding-bottom: 4px;">
                    ${titleHtml}
                </div>
                <div style="font-size: 0.95em; line-height: 1.4;">
                    ${description}
                </div>
            `;

      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    }
  });
}
