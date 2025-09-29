import ApiResponse from "src/entities/ApiResponse";

const logout = (req, res) => {
    res.clearCookie('refresh_token');
    res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
};

export default logout;
