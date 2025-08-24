import DataCategory from './DataCategory';
import Location from './Location';
import Provider from './Provider';
import Time from './Time';

const Filters: React.FC = () => {
  return (
    <>
      <DataCategory />
      <Provider />
      <Location />
      <Time />
    </>
  );
};

export default Filters;
