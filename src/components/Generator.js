import React from 'react';

const Generator = ({ date, downloads, generateData }) => {
  return (
    <div className='generator'>
      <div className='command'>
        <h2 className='title'>Data Generator</h2>
        <input type='date' className='date' ref={date} />
        <button onClick={generateData}>Generate Data</button>
      </div>
      <div className='downloads'>
        <h2 className='title'>Downloads</h2>
        <div className='links'>
          {downloads.map((link, index) => {
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

export default Generator;