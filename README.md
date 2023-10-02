# Assets Wallet

Assets Wallet is a compact application designed to help you manage the values and profits of your private assets,
including stock shares, bank accounts, real estate, bonds, and more. This project is built with a focus on user-friendly
interface, making asset management a breeze.

## Technologies Used

- **Frontend**: Next.js, React
- **Backend (API)**: Nest.js
- **Database**: PostgreSQL
- **Deployment**: Vercel (CI)
- **Testing**: Playwright, Jest
- **Languages**: TypeScript
- **UI Framework**: MUI

## Features

1. **User-Friendly Dashboard**: The dashboard provides a clear overview of your assets, making it easy to track their
   performance.
2. **Advanced Analysis**: Calculate the profits and losses of your investments plus generate charts to visualize your
   financial data.
3. **User Updates**: Asset values and profits are updated by the user, ensuring full control over the data.
4. **Asset Groups**: Organize your assets into groups for better organization and analysis.
5. **Automation with GitHub Actions**: Utilize GitHub Actions for automating tasks like testing and deployment.
6. **Responsive Design**: The application is built with a responsive design to ensure a seamless experience on various
   devices.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository:

   ```shell
   git clone git@github.com:bewon/nest-assets-wallet.git
   ```

2. Install dependencies for both the frontend and API:

   ```shell
   yarn install
   ```

3. Set up your PostgreSQL database and configure the database connection in the API using the `.env` file:

   ```
   POSTGRES_USER=[...]
   POSTGRES_PASSWORD=[...]
   POSTGRES_DATABASE=[...]
   ```

4. Start the frontend and API:

   ```shell
   cd nest-assets-wallet/app
   yarn dev
   cd ../api
   yarn dev
   ```

5. Access the application in your browser at `http://localhost:3000`.

## Testing

Assets Wallet is thoroughly tested to ensure the reliability and performance of the application. Playwright is used for
frontend testing and Jest for unit testing of the API. Here's how you can run tests for each component:

1. Frontend Testing (App needs to be running):

   ```shell
   cd nest-assets-wallet/app
   yarn test
    ```

2. API Testing:

   ```shell
   cd nest-assets-wallet/api
   yarn test
   ```

## Continuous Integration

Continuous integration (CI) is set up using GitHub Actions. Whenever changes are pushed to the repository, CI will
automatically run the tests to catch issues early in the development process.

## License

This project is licensed under the terms of the GNU GPLv3 License. See the [LICENSE](LICENSE) file for more details.
