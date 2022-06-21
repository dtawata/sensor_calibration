import React from 'react';

const Output = ({ outputDownloads, algorithms, version, sendCsv, setCsvFile, upload }) => {
  return (
    <div className='output'>
      <div className='command'>
        <h2 className='title'>Get Data Output</h2>
        <div className='flex'>
          <div className='version'>Version</div>
          <select ref={version} className='select'>
            {algorithms.map((algorithm, index) => {
              return <option key={index}>{`${algorithm.major}.${algorithm.minor}.${algorithm.patch}`}</option>
            })}
          </select>
        </div>
        <form onSubmit={sendCsv}>
          <input onChange={(e) => { setCsvFile(e.target.files[0]); }} type='file' className='file' ref={upload} />
          <button type='submit'>Submit</button>
        </form>
      </div>
      <div className='downloads'>
        <h2 className='title'>Downloads</h2>
        <div className='links'>
          {outputDownloads.map((link, index) => {
            return <Link link={link} key={index} />
          })}
        </div>
      </div>
    </div>
  );
};

const Link = ({ link }) => {
  return (
    <div className='link'>
      <a href={`data:text/csv;charset=utf-8,${(link.data)}`} download={link.name}>{link.cta}</a>
    </div>
  );
};

export default Output;