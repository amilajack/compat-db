// @flow
function mapItems(record) {
  // Get all browsers
  const browsers = Object.keys(record.targets);
  const listElementArray = [];

  browsers.forEach(browser => {
    listElementArray.push(`${browser}: `);
    // eslint-disable-next-line
    for (const version in record.targets[browser]) {
      listElementArray.push(`${version} ${record.targets[browser][version] === 'y' ? '✅' : '❌'}`);
    }
    listElementArray.push('<br>');
  });

  return `
    <li>
      <h2>${record.protoChainId}</h2>
      <br>
      ${listElementArray.join('')}
    </li>
  `;
}

fetch('/all.json')
  .then(res => res.json())
  .then(res => {
    const renderedHTML = res.records
      .map(mapItems)
      .join('');

    const div = document.createElement('div');
    div.innerHTML = `<ul>${renderedHTML}</ul>`;

    if (document.body) {
      document.body.appendChild(div);
    }

    return true;
  })
  .catch(console.log);
