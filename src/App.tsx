import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ConnectFormProvider } from "@/contexts/ConnectFormContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="codebay-theme" attribute="class">
    <BrowserRouter>
      <ConnectFormProvider>
        <Routes>
          <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ConnectFormProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
