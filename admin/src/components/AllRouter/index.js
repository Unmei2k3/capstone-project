
import { useRoutes } from "react-router-dom";
// import { routes } from "../../routes";
import { routes } from '../../constants/routes';

function AllRouter() {
  const elements = useRoutes(routes);
  return (
    <>
      {elements}
    </>
  );
}
export default AllRouter;