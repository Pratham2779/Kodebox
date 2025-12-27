import mysql from "mysql2/promise";

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,        // kodebox-mysql
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,        // kodebox_user
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
      queueLimit: 0,
    });

    
    const connection = await pool.getConnection();
    console.log(
      `\nMySQL connection successful Host : [${connection.config.host}]\n`
    );
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed", error);
    process.exit(1);
  }
};

export { connectDB, pool };

