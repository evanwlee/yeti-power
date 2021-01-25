
import React from 'react';
const List = (props) => {
  const { repos } = props;
  if (!repos || repos.length === 0) return <p>No data, sorry</p>;
  console.log(repos);
  return (
    <ul>
      <h2 className='list-head'>Attributes</h2>
      
      {/* {repos.map((repo) => {
        return (
          <li key={repo.whStored} className='list'>
            <span className='repo-text'>{repo.whStored} </span>
            <span className='repo-description'>{repo.whStored}</span>
          </li>
        );
      })} */}
    </ul>
  );
};
export default List;