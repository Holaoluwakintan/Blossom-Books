import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home, { BookDetail, Discover, Library, NotFoundPage, Reader } from "./pages/Home";
import Community, { AuthorPage, JournalPage, Notifications } from "./pages/Community";
import WriterStudio from "./pages/WriterStudio";
import ProfilePage from "./pages/ProfilePage";

function Router() { return <Switch>
  <Route path="/" component={Home} /><Route path="/discover" component={Discover} /><Route path="/library" component={Library} /><Route path="/create" component={WriterStudio} /><Route path="/write" component={WriterStudio} /><Route path="/profile" component={ProfilePage} /><Route path="/community" component={Community} /><Route path="/notifications" component={Notifications} /><Route path="/authors/:slug" component={AuthorPage} /><Route path="/journal/:slug" component={JournalPage} /><Route path="/book/:id" component={BookDetail} /><Route path="/read/:id" component={Reader} /><Route component={NotFoundPage} />
</Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="bottom-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
