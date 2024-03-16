import * as React from 'react';
import * as htmlToImage from 'html-to-image';
import './style.css';

const formfields = [
  'name',
  'address',
  'amount',
  'landlord',
  'start_date',
  'end_date',
];

function Form({ setFormInput }) {
  const fieldtypes = {
    amount: 'number',
    start_date: 'month',
    end_date: 'month',
  };

  return (
    <>
      <table>
        {formfields.map((field) => (
          <tr>
            <td>{field}</td>
            <input
              type={fieldtypes[field]}
              onChange={(e) =>
                setFormInput((f) => ({ ...f, [field]: e.target.value }))
              }
            />
          </tr>
        ))}
      </table>
    </>
  );
}

function Receipts({ data, formInput: { name, amount, address, landlord } }) {
  return data.map(({ date_from, date_to, month, year }, i) => {
    return (
      <>
        <br />
        <div
          className="receipt"
          style={{
            background: 'white',
            border: '1px solid',
          }}
        >
          <div style={{ border: '1px solid', padding: '1rem', margin: '1rem' }}>
            <h2>RENT RECEIPT {month_names[month - 1] + ' ' + year}</h2>

            <div
              style={{
                display: 'flex',
                'justify-content': 'space-between',
              }}
            >
              <div>
                <div>&nbsp;</div>
                <div>Receipt No: {i + 1}</div>
                <div>Date: {date_from}</div>
              </div>
              <img
                style={{ height: '80px' }}
                src={
                  'https://m.media-amazon.com/images/I/81RFYD+g2dL.SS700.jpg'
                }
              />
            </div>
            <p>
              Received sum of INR Rs.{Bold(amount)} from {Bold(name)} towards
              the rent of property located at {Bold(address)} for the period
              from {Bold(date_from)} to {Bold(date_to)}.
            </p>
            <span>{Bold(landlord)} (Landlord)</span>
            <div>
              <img
                style={{ height: '30px' }}
                src={'https://i.imgur.com/uZVAspY.png'}
              />
            </div>
          </div>
        </div>
      </>
    );
  });
}

export default function App() {
  const [data, setData] = React.useState([]);
  const [formInput, setFormInput] = React.useState([]);
  React.useEffect(() => {
    if (formfields.some((e) => !formInput[e])) return setData([]);

    const start = formInput.start_date
      .split('-')
      .map((e) => Number(e))
      .reverse();
    const end = formInput.end_date
      .split('-')
      .map((e) => Number(e))
      .reverse();

    let data = [];

    let endx = 12 * (end[1] - start[1]) + end[0];
    let startx = start[0] - 1;

    while (endx > startx) {
      let month = startx % 12;
      let extrayears = ~~(startx / 12);
      const [m, y] = [month + 1, start[1] + extrayears];
      data.push({
        month: m,
        year: y,
        date_from: dateformat(1, m, y),
        date_to: dateformat(getDaysInMonth(m, y), m, y),
      });
      startx++;
    }

    setData(data);
  }, [formInput]);
  return (
    <div>
      <Form setFormInput={setFormInput} />

      <button
        disabled={!data.length}
        onClick={() => {
          let i = 0;
          for (let item of document.getElementsByClassName('receipt')) {
            const dataitem = data[i];
            convertToImageAndExport(
              item,
              month_names[dataitem.month - 1] + '-' + dataitem.year
            );
            i++;
          }
        }}
      >
        export receipts
      </button>

      <Receipts data={data} formInput={formInput} />
    </div>
  );
}

function Bold(data) {
  return <span style={{ 'font-weight': 'bold' }}>{data}</span>;
}

function dateformat(...nums) {
  return nums.join('/');
}

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

const month_names = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function convertToImageAndExport(divToExport, name) {
  htmlToImage
    .toJpeg(divToExport)
    .then(function (dataUrl) {
      const link = document.createElement('a');
      link.download = name + '.png'; // Set the download attribute to specify the file
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(function (error) {
      console.error('Error exporting div as image:', error);
    });
}
