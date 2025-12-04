import { Button, Input, TextArea, Card, Badge, Spinner } from '@aplifyai/ui';

export default function TestPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-8">Shared Component Library</h1>

            {/* Buttons */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </Card>

            {/* Inputs */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Inputs</h2>
                <div className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        fullWidth
                    />
                    <Input
                        label="Password"
                        type="password"
                        helperText="Must be at least 8 characters"
                        fullWidth
                    />
                    <Input
                        label="Error State"
                        error="This field is required"
                        fullWidth
                    />
                </div>
            </Card>

            {/* TextArea */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">TextArea</h2>
                <TextArea
                    label="Description"
                    placeholder="Enter a description..."
                    rows={4}
                    fullWidth
                />
            </Card>

            {/* Badges */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Badges</h2>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="gray">Gray</Badge>
                    <Badge size="sm">Small</Badge>
                    <Badge size="lg">Large</Badge>
                </div>
            </Card>

            {/* Spinners */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Loading Spinners</h2>
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <Spinner size="sm" />
                        <p className="text-sm mt-2">Small</p>
                    </div>
                    <div className="text-center">
                        <Spinner size="md" />
                        <p className="text-sm mt-2">Medium</p>
                    </div>
                    <div className="text-center">
                        <Spinner size="lg" />
                        <p className="text-sm mt-2">Large</p>
                    </div>
                    <div className="text-center bg-primary-600 p-4 rounded">
                        <Spinner color="white" />
                        <p className="text-sm mt-2 text-white">On Dark</p>
                    </div>
                </div>
            </Card>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card shadow="soft">
                    <h3 className="font-semibold mb-2">Soft Shadow</h3>
                    <p className="text-sm text-gray-600">Subtle elevation</p>
                </Card>
                <Card shadow="medium" hover>
                    <h3 className="font-semibold mb-2">Medium Shadow + Hover</h3>
                    <p className="text-sm text-gray-600">Hover me!</p>
                </Card>
                <Card shadow="hard">
                    <h3 className="font-semibold mb-2">Hard Shadow</h3>
                    <p className="text-sm text-gray-600">Strong elevation</p>
                </Card>
            </div>
        </div>
    );
}
