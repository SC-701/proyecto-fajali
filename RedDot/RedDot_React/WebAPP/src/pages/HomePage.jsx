import { Navbar } from "../layout/Navbar";
import { Container } from "@mui/material";

export const HomePage = () => {
    return (
        <div>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 10, mb: 5 }}>
            <h1>Welcome to RedDot</h1>
            <p>Your one-stop solution for tournament management.</p>
            <p>Explore the features and manage your tournaments efficiently.</p>
            </Container>
        </div>
    );
}