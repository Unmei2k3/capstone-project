import { useRoutes } from "react-router-dom";
import { routes } from "../../constant/routes";



function AllRouter() {
    const elements = useRoutes(routes);
  return (
    <>
    {elements}
    </>
  );
}   
export default AllRouter;