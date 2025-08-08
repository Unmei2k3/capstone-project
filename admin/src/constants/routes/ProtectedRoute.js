import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../redux/slices/messageSlice';
import { useEffect } from 'react';
import { setIsLoggedOut } from '../../redux/slices/userSlice';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const dispatch = useDispatch();
    const { accessToken, isInitializing, user, isLoggedOut } = useSelector((state) => state.user);
    console.log("is loggout : ", isLoggedOut);

    useEffect(() => {
        if (isLoggedOut) {
            dispatch(setMessage({
                type: 'success',
                content: 'Bạn đã đăng xuất thành công!',
            }));
            dispatch(setIsLoggedOut(false));
        }
    }, [dispatch, isLoggedOut]);



    if (isInitializing) {
        return <div>...Loading</div>;
    }

    if (isLoggedOut || !user || !accessToken) {
   
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
        dispatch(setMessage({
            type: 'error',
            content: 'Bạn không có quyền truy cập trang này!',
        }));
        return <Navigate to="/unauthorized" replace />;
    }

    // Nếu mọi thứ ok thì render children (layout + page)
    return children;
};

export default ProtectedRoute;
